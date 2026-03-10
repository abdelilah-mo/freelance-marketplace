<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ServiceManagementController extends Controller
{
    public function index(): JsonResponse
    {
        $services = Service::query()
            ->with(['category', 'freelancer'])
            ->latest()
            ->paginate(20);

        return response()->json($services);
    }

    public function update(Request $request, Service $service): JsonResponse
    {
        $validated = $request->validate([
            'is_active' => ['sometimes', 'boolean'],
            'price' => ['sometimes', 'numeric', 'min:5'],
        ]);

        $service->update($validated);

        return response()->json([
            'message' => 'Service updated successfully.',
            'data' => $service->fresh()->load(['category', 'freelancer']),
        ]);
    }

    public function destroy(Service $service): JsonResponse
    {
        if ($service->image_path) {
            Storage::disk('public')->delete($service->image_path);
        }

        $service->delete();

        return response()->json([
            'message' => 'Service deleted successfully.',
        ]);
    }
}
