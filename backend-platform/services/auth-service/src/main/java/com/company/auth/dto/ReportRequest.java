package com.company.auth.dto;

import java.util.List;

public class ReportRequest {
    private String reportType; // sales, order, customer, inventory
    private String startDate; // ISO date
    private String endDate;
    private String reportFormat; // csv, excel, pdf, json
    private List<String> categoryIds;
    private List<String> productIds;
    private String paymentStatus;
    private String orderStatus;
    private String customerId;
    private Boolean includeCancelled;
    private Boolean includeTax;

    public ReportRequest() {}

    // getters and setters
    public String getReportType() { return reportType; }
    public void setReportType(String reportType) { this.reportType = reportType; }
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }
    public String getReportFormat() { return reportFormat; }
    public void setReportFormat(String reportFormat) { this.reportFormat = reportFormat; }
    public List<String> getCategoryIds() { return categoryIds; }
    public void setCategoryIds(List<String> categoryIds) { this.categoryIds = categoryIds; }
    public List<String> getProductIds() { return productIds; }
    public void setProductIds(List<String> productIds) { this.productIds = productIds; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public String getOrderStatus() { return orderStatus; }
    public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }
    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }
    public Boolean getIncludeCancelled() { return includeCancelled; }
    public void setIncludeCancelled(Boolean includeCancelled) { this.includeCancelled = includeCancelled; }
    public Boolean getIncludeTax() { return includeTax; }
    public void setIncludeTax(Boolean includeTax) { this.includeTax = includeTax; }
}
