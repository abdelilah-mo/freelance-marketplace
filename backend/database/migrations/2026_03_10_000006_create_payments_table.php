<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('provider')->default('mock');
            $table->string('checkout_session_id')->nullable();
            $table->string('payment_intent_id')->nullable();
            $table->decimal('amount', 10, 2);
            $table->string('currency', 10)->default('usd');
            $table->string('status')->default('pending')->index();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
