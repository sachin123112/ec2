package com.company.auth.model;

import jakarta.persistence.*;

@Entity
@Table(name = "notification_settings")
public class NotificationSettings {
    @Id
    private Long id = 1L;

    @Column(name = "new_order_notifications", nullable = false)
    private boolean newOrderNotifications = true;
    @Column(name = "low_stock_alerts", nullable = false)
    private boolean lowStockAlerts = true;
    @Column(name = "customer_reviews", nullable = false)
    private boolean customerReviews = true;
    @Column(name = "order_status_updates", nullable = false)
    private boolean orderStatusUpdates = true;
    @Column(name = "daily_summary", nullable = false)
    private boolean dailySummary;
    @Column(name = "marketing_updates", nullable = false)
    private boolean marketingUpdates;

    public Long getId() { return id; }
    public boolean isNewOrderNotifications() { return newOrderNotifications; }
    public void setNewOrderNotifications(boolean value) { newOrderNotifications = value; }
    public boolean isLowStockAlerts() { return lowStockAlerts; }
    public void setLowStockAlerts(boolean value) { lowStockAlerts = value; }
    public boolean isCustomerReviews() { return customerReviews; }
    public void setCustomerReviews(boolean value) { customerReviews = value; }
    public boolean isOrderStatusUpdates() { return orderStatusUpdates; }
    public void setOrderStatusUpdates(boolean value) { orderStatusUpdates = value; }
    public boolean isDailySummary() { return dailySummary; }
    public void setDailySummary(boolean value) { dailySummary = value; }
    public boolean isMarketingUpdates() { return marketingUpdates; }
    public void setMarketingUpdates(boolean value) { marketingUpdates = value; }
}
