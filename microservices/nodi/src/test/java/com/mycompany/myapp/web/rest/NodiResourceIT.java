package com.mycompany.myapp.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.mycompany.myapp.IntegrationTest;
import com.mycompany.myapp.domain.Nodi;
import com.mycompany.myapp.repository.NodiRepository;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import javax.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link NodiResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class NodiResourceIT {

    private static final String DEFAULT_FIELD_1 = "AAAAAAAAAA";
    private static final String UPDATED_FIELD_1 = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/nodis";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private NodiRepository nodiRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restNodiMockMvc;

    private Nodi nodi;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Nodi createEntity(EntityManager em) {
        Nodi nodi = new Nodi().field1(DEFAULT_FIELD_1);
        return nodi;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Nodi createUpdatedEntity(EntityManager em) {
        Nodi nodi = new Nodi().field1(UPDATED_FIELD_1);
        return nodi;
    }

    @BeforeEach
    public void initTest() {
        nodi = createEntity(em);
    }

    @Test
    @Transactional
    void createNodi() throws Exception {
        int databaseSizeBeforeCreate = nodiRepository.findAll().size();
        // Create the Nodi
        restNodiMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(nodi))
            )
            .andExpect(status().isCreated());

        // Validate the Nodi in the database
        List<Nodi> nodiList = nodiRepository.findAll();
        assertThat(nodiList).hasSize(databaseSizeBeforeCreate + 1);
        Nodi testNodi = nodiList.get(nodiList.size() - 1);
        assertThat(testNodi.getField1()).isEqualTo(DEFAULT_FIELD_1);
    }

    @Test
    @Transactional
    void createNodiWithExistingId() throws Exception {
        // Create the Nodi with an existing ID
        nodi.setId(1L);

        int databaseSizeBeforeCreate = nodiRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restNodiMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(nodi))
            )
            .andExpect(status().isBadRequest());

        // Validate the Nodi in the database
        List<Nodi> nodiList = nodiRepository.findAll();
        assertThat(nodiList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllNodis() throws Exception {
        // Initialize the database
        nodiRepository.saveAndFlush(nodi);

        // Get all the nodiList
        restNodiMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(nodi.getId().intValue())))
            .andExpect(jsonPath("$.[*].field1").value(hasItem(DEFAULT_FIELD_1)));
    }

    @Test
    @Transactional
    void getNodi() throws Exception {
        // Initialize the database
        nodiRepository.saveAndFlush(nodi);

        // Get the nodi
        restNodiMockMvc
            .perform(get(ENTITY_API_URL_ID, nodi.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(nodi.getId().intValue()))
            .andExpect(jsonPath("$.field1").value(DEFAULT_FIELD_1));
    }

    @Test
    @Transactional
    void getNonExistingNodi() throws Exception {
        // Get the nodi
        restNodiMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingNodi() throws Exception {
        // Initialize the database
        nodiRepository.saveAndFlush(nodi);

        int databaseSizeBeforeUpdate = nodiRepository.findAll().size();

        // Update the nodi
        Nodi updatedNodi = nodiRepository.findById(nodi.getId()).get();
        // Disconnect from session so that the updates on updatedNodi are not directly saved in db
        em.detach(updatedNodi);
        updatedNodi.field1(UPDATED_FIELD_1);

        restNodiMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedNodi.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedNodi))
            )
            .andExpect(status().isOk());

        // Validate the Nodi in the database
        List<Nodi> nodiList = nodiRepository.findAll();
        assertThat(nodiList).hasSize(databaseSizeBeforeUpdate);
        Nodi testNodi = nodiList.get(nodiList.size() - 1);
        assertThat(testNodi.getField1()).isEqualTo(UPDATED_FIELD_1);
    }

    @Test
    @Transactional
    void putNonExistingNodi() throws Exception {
        int databaseSizeBeforeUpdate = nodiRepository.findAll().size();
        nodi.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restNodiMockMvc
            .perform(
                put(ENTITY_API_URL_ID, nodi.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(nodi))
            )
            .andExpect(status().isBadRequest());

        // Validate the Nodi in the database
        List<Nodi> nodiList = nodiRepository.findAll();
        assertThat(nodiList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchNodi() throws Exception {
        int databaseSizeBeforeUpdate = nodiRepository.findAll().size();
        nodi.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNodiMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(nodi))
            )
            .andExpect(status().isBadRequest());

        // Validate the Nodi in the database
        List<Nodi> nodiList = nodiRepository.findAll();
        assertThat(nodiList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamNodi() throws Exception {
        int databaseSizeBeforeUpdate = nodiRepository.findAll().size();
        nodi.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNodiMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(nodi))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Nodi in the database
        List<Nodi> nodiList = nodiRepository.findAll();
        assertThat(nodiList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateNodiWithPatch() throws Exception {
        // Initialize the database
        nodiRepository.saveAndFlush(nodi);

        int databaseSizeBeforeUpdate = nodiRepository.findAll().size();

        // Update the nodi using partial update
        Nodi partialUpdatedNodi = new Nodi();
        partialUpdatedNodi.setId(nodi.getId());

        restNodiMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedNodi.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedNodi))
            )
            .andExpect(status().isOk());

        // Validate the Nodi in the database
        List<Nodi> nodiList = nodiRepository.findAll();
        assertThat(nodiList).hasSize(databaseSizeBeforeUpdate);
        Nodi testNodi = nodiList.get(nodiList.size() - 1);
        assertThat(testNodi.getField1()).isEqualTo(DEFAULT_FIELD_1);
    }

    @Test
    @Transactional
    void fullUpdateNodiWithPatch() throws Exception {
        // Initialize the database
        nodiRepository.saveAndFlush(nodi);

        int databaseSizeBeforeUpdate = nodiRepository.findAll().size();

        // Update the nodi using partial update
        Nodi partialUpdatedNodi = new Nodi();
        partialUpdatedNodi.setId(nodi.getId());

        partialUpdatedNodi.field1(UPDATED_FIELD_1);

        restNodiMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedNodi.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedNodi))
            )
            .andExpect(status().isOk());

        // Validate the Nodi in the database
        List<Nodi> nodiList = nodiRepository.findAll();
        assertThat(nodiList).hasSize(databaseSizeBeforeUpdate);
        Nodi testNodi = nodiList.get(nodiList.size() - 1);
        assertThat(testNodi.getField1()).isEqualTo(UPDATED_FIELD_1);
    }

    @Test
    @Transactional
    void patchNonExistingNodi() throws Exception {
        int databaseSizeBeforeUpdate = nodiRepository.findAll().size();
        nodi.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restNodiMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, nodi.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(nodi))
            )
            .andExpect(status().isBadRequest());

        // Validate the Nodi in the database
        List<Nodi> nodiList = nodiRepository.findAll();
        assertThat(nodiList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchNodi() throws Exception {
        int databaseSizeBeforeUpdate = nodiRepository.findAll().size();
        nodi.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNodiMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(nodi))
            )
            .andExpect(status().isBadRequest());

        // Validate the Nodi in the database
        List<Nodi> nodiList = nodiRepository.findAll();
        assertThat(nodiList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamNodi() throws Exception {
        int databaseSizeBeforeUpdate = nodiRepository.findAll().size();
        nodi.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNodiMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(nodi))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Nodi in the database
        List<Nodi> nodiList = nodiRepository.findAll();
        assertThat(nodiList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteNodi() throws Exception {
        // Initialize the database
        nodiRepository.saveAndFlush(nodi);

        int databaseSizeBeforeDelete = nodiRepository.findAll().size();

        // Delete the nodi
        restNodiMockMvc
            .perform(delete(ENTITY_API_URL_ID, nodi.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Nodi> nodiList = nodiRepository.findAll();
        assertThat(nodiList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
