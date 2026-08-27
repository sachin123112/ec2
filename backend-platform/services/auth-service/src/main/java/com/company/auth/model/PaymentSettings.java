package com.company.auth.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "payment_settings")
public class PaymentSettings {
    @Id
    private Long id = 1L;
    private String razorpayKeyId;
    private String razorpayKeySecret;
    private boolean stripeActive;
    private boolean paypalActive;
    private boolean cashOnDeliveryActive = true;
    private boolean upiActive = true;
    private boolean netBankingActive = true;
    private boolean creditCardActive = true;
    private boolean debitCardActive = true;
    private boolean qrCodeActive = true;
    private String upiId = "sachinprakash893@ybl";
    private BigDecimal freeShippingThreshold = BigDecimal.valueOf(999);
    private BigDecimal shippingFee = BigDecimal.valueOf(99);

    public Long getId() { return id; }
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
    public boolean isNetBankingActive() { return netBankingActive; }
    public void setNetBankingActive(boolean value) { netBankingActive = value; }
    public boolean isCreditCardActive() { return creditCardActive; }
    public void setCreditCardActive(boolean value) { creditCardActive = value; }
    public boolean isDebitCardActive() { return debitCardActive; }
    public void setDebitCardActive(boolean value) { debitCardActive = value; }
    public boolean isQrCodeActive() { return qrCodeActive; }
    public void setQrCodeActive(boolean value) { qrCodeActive = value; }
    public String getUpiId() { return upiId; }
    public void setUpiId(String value) { upiId = value; }
    public BigDecimal getFreeShippingThreshold() { return freeShippingThreshold; }
    public void setFreeShippingThreshold(BigDecimal value) { freeShippingThreshold = value; }
    public BigDecimal getShippingFee() { return shippingFee; }
    public void setShippingFee(BigDecimal value) { shippingFee = value; }
}