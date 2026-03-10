<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ServiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Service::query()
            ->with(['category', 'freelancer'])
            ->where('is_active', true);

        if ($search = $request->string('q')->toString()) {
            $query->where(function ($builder) use ($search): void {
                $builder
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($category = $request->string('category')->toString()) {
            $query->whereHas('category', function ($builder) use ($category): void {
                if (is_numeric($category)) {
                    $builder->where('id', (int) $category);
                    return;
                }

                $builder->where('slug', $category);
            });
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->float('min_price'));
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->float('max_price'));
        }

        match ($request->string('sort')->toString()) {
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            default => $query->latest(),
        };

        return response()->json($query->paginate(12));
    }

    public function show(Service $service): JsonResponse
    {
        $service->load(['category', 'freelancer']);

        return response()->json([
            'data' => $service,
        ]);
    }

    public function myServices(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = $user->isAdmin()
            ? Service::query()
            : $user->services();

        $services = $query
            ->with(['category', 'freelancer'])
            ->latest()
            ->get();

        return response()->json([
            'data' => $services,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'min:20'],
            'price' => ['required', 'numeric', 'min:5'],
            'delivery_days' => ['required', 'integer', 'min:1', 'max:60'],
            'category_id' => ['required', 'exists:categories,id'],
            'image' => ['nullable', 'image', 'max:2048'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $service = Service::create([
            'freelancer_id' => $request->user()->id,
            'category_id' => $validated['category_id'],
            'title' => $validated['title'],
            'slug' => $this->makeUniqueSlug($validated['title']),
            'description' => $validated['description'],
            'price' => $validated['price'],
            'delivery_days' => $validated['delivery_days'],
            'image_path' => $request->hasFile('image') ? $request->file('image')->store('services', 'public') : null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Service created successfully.',
            'data' => $service->load(['category', 'freelancer']),
        ], 201);
    }

    public function update(Request $request, Service $service): JsonResponse
    {
        $this->authorizeOwnerOrAdmin($request, $service);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'min:20'],
            'price' => ['required', 'numeric', 'min:5'],
            'delivery_days' => ['required', 'integer', 'min:1', 'max:60'],
            'category_id' => ['required', Rule::exists('categories', 'id')],
            'image' => ['nullable', 'image', 'max:2048'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if ($request->hasFile('image')) {
            if ($service->image_path) {
                Storage::disk('public')->delete($service->image_path);
            }

            $service->image_path = $request->file('image')->store('services', 'public');
        }

        $service->fill([
            'title' => $validated['title'],
            'slug' => $this->makeUniqueSlug($validated['title'], $service->id),
            'description' => $validated['description'],
            'price' => $validated['price'],
            'delivery_days' => $validated['delivery_days'],
            'category_id' => $validated['category_id'],
            'is_active' => $validated['is_active'] ?? $service->is_active,
        ])->save();

        return response()->json([
            'message' => 'Service updated successfully.',
            'data' => $service->load(['category', 'freelancer']),
        ]);
    }

    public function destroy(Request $request, Service $service): JsonResponse
    {
        $this->authorizeOwnerOrAdmin($request, $service);

        if ($service->image_path) {
            Storage::disk('public')->delete($service->image_path);
        }

        $service->delete();

        return response()->json([
            'message' => 'Service deleted successfully.',
        ]);
    }

    private function authorizeOwnerOrAdmin(Request $request, Service $service): void
    {
        $user = $request->user();

        abort_unless($user->isAdmin() || $service->freelancer_id === $user->id, 403, 'You do not have permission to manage this service.');
    }

    private function makeUniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($title);
        $slug = $baseSlug;
        $counter = 2;

        while (Service::query()
            ->where('slug', $slug)
            ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
            ->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}
