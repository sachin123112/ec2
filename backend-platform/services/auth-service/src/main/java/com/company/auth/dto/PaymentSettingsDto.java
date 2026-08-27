package com.company.auth.dto;

import java.math.BigDecimal;

public class PaymentSettingsDto {
    private String razorpayKeyId;
    private String razorpayKeySecret;
    private boolean stripeActive;
    private boolean paypalActive;
    private boolean cashOnDeliveryActive;
    private boolean upiActive;
    private String upiId;
    private BigDecimal freeShippingThreshold;
    private BigDecimal shippingFee;

    public String getRazorpayKeyId() { return razorpayKeyId; }
    public void setRazorpayKeyId(String value) { razorpayKeyId = value; }
    public String getRazorpayKeySecret() { return razorpayKeySecret; }
    public void setRazorpayKeySecret(String value) { razorpayKeySecret = value; }
    public boolean isStripeActive() { return stripeActive; }
    public void setStripeActive(boolean value) { stripeActive = value; }
    public boolean isPaypalActive() { return paypalActive; }
    public void setPaypalActive(boolean value) { paypalActive = value; }
    public boolean isCashOnDeliveryActive() { return cashOnDeliveryActive; }
    public void setCashOnDeliveryActive(boolean value) { cashOnDeliveryActive = value; }
    public boolean isUpiActive() { return upiActive; }
    public void setUpiActive(boolean value) { upiActive = value; }
    public String getUpiId() { return upiId; }
    public void setUpiId(String value) { upiId = value; }
    public BigDecimal getFreeShippingThreshold() { return freeShippingThreshold; }
    public void setFreeShippingThreshold(BigDecimal value) { freeShippingThreshold = value; }
    public BigDecimal getShippingFee() { return shippingFee; }
    public void setShippingFee(BigDecimal value) { shippingFee = value; }
}