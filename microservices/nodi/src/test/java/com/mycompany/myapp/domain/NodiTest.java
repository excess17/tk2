package com.mycompany.myapp.domain;

import static org.assertj.core.api.Assertions.assertThat;

import com.mycompany.myapp.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class NodiTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Nodi.class);
        Nodi nodi1 = new Nodi();
        nodi1.setId(1L);
        Nodi nodi2 = new Nodi();
        nodi2.setId(nodi1.getId());
        assertThat(nodi1).isEqualTo(nodi2);
        nodi2.setId(2L);
        assertThat(nodi1).isNotEqualTo(nodi2);
        nodi1.setId(null);
        assertThat(nodi1).isNotEqualTo(nodi2);
    }
}
