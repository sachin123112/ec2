package com.company.auth.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ProductTest {

    @Test
    void shouldTrackNetQuantity() {
        Product product = new Product();
        product.setNetQuantity(12);

        assertEquals(12, product.getNetQuantity());
    }
}
