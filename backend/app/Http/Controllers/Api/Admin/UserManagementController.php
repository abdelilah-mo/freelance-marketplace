<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::query()
            ->withCount(['services', 'clientOrders', 'freelancerOrders'])
            ->latest()
            ->paginate(20);

        return response()->json($users);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['sometimes', 'in:admin,client,freelancer'],
            'headline' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully.',
            'data' => $user->fresh(),
        ]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        abort_if($request->user()->id === $user->id, 422, 'You cannot delete your own admin account.');

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.',
        ]);
    }
}
