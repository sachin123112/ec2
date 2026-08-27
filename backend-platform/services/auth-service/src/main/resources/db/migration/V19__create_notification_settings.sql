CREATE TABLE notification_settings (
    id BIGINT PRIMARY KEY,
    new_order_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    low_stock_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    customer_reviews BOOLEAN NOT NULL DEFAULT TRUE,
    order_status_updates BOOLEAN NOT NULL DEFAULT TRUE,
    daily_summary BOOLEAN NOT NULL DEFAULT FALSE,
    marketing_updates BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO notification_settings (id) VALUES (1);
