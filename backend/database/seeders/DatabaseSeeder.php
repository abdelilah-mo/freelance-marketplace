<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $categories = collect([
            ['name' => 'Web Development', 'slug' => 'web-development', 'description' => 'Custom websites, dashboards, and API development.'],
            ['name' => 'Design', 'slug' => 'design', 'description' => 'UI/UX, branding, and product design services.'],
            ['name' => 'Marketing', 'slug' => 'marketing', 'description' => 'Digital campaigns, SEO, and growth strategy.'],
            ['name' => 'Writing', 'slug' => 'writing', 'description' => 'Copywriting, blog content, and technical documentation.'],
        ])->map(fn (array $category) => Category::updateOrCreate(
            ['slug' => $category['slug']],
            $category,
        ));

        $admin = User::updateOrCreate([
            'email' => 'admin@marketplace.test',
        ], [
            'name' => 'Marketplace Admin',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'headline' => 'Platform administrator',
            'bio' => 'Oversees users, services, and orders.',
        ]);

        $freelancer = User::updateOrCreate([
            'email' => 'freelancer@marketplace.test',
        ], [
            'name' => 'Amina Seller',
            'password' => Hash::make('password'),
            'role' => 'freelancer',
            'headline' => 'Full-stack freelancer',
            'bio' => 'Ships Laravel, React, and DevOps work for startup teams.',
        ]);

        $client = User::updateOrCreate([
            'email' => 'client@marketplace.test',
        ], [
            'name' => 'Nora Client',
            'password' => Hash::make('password'),
            'role' => 'client',
            'headline' => 'Product manager',
            'bio' => 'Orders design and development work for product launches.',
        ]);

        $services = [
            [
                'title' => 'Build a Laravel REST API for your SaaS',
                'slug' => 'build-a-laravel-rest-api-for-your-saas',
                'description' => 'Production-ready Laravel API with authentication, testing, and deployment notes.',
                'price' => 450,
                'delivery_days' => 5,
                'category_id' => $categories[0]->id,
            ],
            [
                'title' => 'Design a polished landing page in Figma',
                'slug' => 'design-a-polished-landing-page-in-figma',
                'description' => 'High-conversion landing page with responsive layouts and handoff-ready components.',
                'price' => 220,
                'delivery_days' => 3,
                'category_id' => $categories[1]->id,
            ],
            [
                'title' => 'Write persuasive SEO blog content',
                'slug' => 'write-persuasive-seo-blog-content',
                'description' => 'Keyword-driven article package tailored for B2B software teams.',
                'price' => 120,
                'delivery_days' => 2,
                'category_id' => $categories[3]->id,
            ],
        ];

        $createdServices = collect($services)->map(fn (array $service) => Service::updateOrCreate(
            ['slug' => $service['slug']],
            array_merge($service, [
                'freelancer_id' => $freelancer->id,
                'is_active' => true,
            ]),
        ));

        $order = Order::updateOrCreate([
            'service_id' => $createdServices[0]->id,
            'client_id' => $client->id,
        ], [
            'freelancer_id' => $freelancer->id,
            'requirements' => 'Need JWT auth, MySQL integration, and deployment notes for Ubuntu.',
            'total_amount' => $createdServices[0]->price,
            'status' => 'in_progress',
        ]);

        Payment::updateOrCreate([
            'order_id' => $order->id,
        ], [
            'provider' => 'mock',
            'checkout_session_id' => 'seeded_mock_checkout',
            'payment_intent_id' => 'seeded_mock_intent',
            'amount' => $order->total_amount,
            'currency' => 'usd',
            'status' => 'paid',
            'paid_at' => now(),
        ]);
    }
}
