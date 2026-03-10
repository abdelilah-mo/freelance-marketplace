CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'client',
  headline VARCHAR(255) NULL,
  bio TEXT NULL,
  avatar VARCHAR(255) NULL,
  api_token VARCHAR(64) NULL UNIQUE,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  email_verified_at TIMESTAMP NULL,
  remember_token VARCHAR(100) NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);

CREATE TABLE categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL
);

CREATE TABLE services (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  freelancer_id BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  delivery_days INT UNSIGNED NOT NULL DEFAULT 3,
  image_path VARCHAR(255) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  CONSTRAINT services_freelancer_id_foreign FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT services_category_id_foreign FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  service_id BIGINT UNSIGNED NOT NULL,
  client_id BIGINT UNSIGNED NOT NULL,
  freelancer_id BIGINT UNSIGNED NOT NULL,
  requirements TEXT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  CONSTRAINT orders_service_id_foreign FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  CONSTRAINT orders_client_id_foreign FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT orders_freelancer_id_foreign FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL UNIQUE,
  provider VARCHAR(50) NOT NULL DEFAULT 'mock',
  checkout_session_id VARCHAR(255) NULL,
  payment_intent_id VARCHAR(255) NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'usd',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  CONSTRAINT payments_order_id_foreign FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
