package com.company.auth.dto;

public class NotificationSettingsDto {
    private boolean newOrderNotifications;
    private boolean lowStockAlerts;
    private boolean customerReviews;
    private boolean orderStatusUpdates;
    private boolean dailySummary;
    private boolean marketingUpdates;

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
