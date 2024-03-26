package com.mycompany.myapp.web.rest;

import com.mycompany.myapp.domain.Nodi;
import com.mycompany.myapp.repository.NodiRepository;
import com.mycompany.myapp.web.rest.errors.BadRequestAlertException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.mycompany.myapp.domain.Nodi}.
 */
@RestController
@RequestMapping("/api")
@Transactional
public class NodiResource {

    private final Logger log = LoggerFactory.getLogger(NodiResource.class);

    private static final String ENTITY_NAME = "nodiNodi";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final NodiRepository nodiRepository;

    public NodiResource(NodiRepository nodiRepository) {
        this.nodiRepository = nodiRepository;
    }

    /**
     * {@code POST  /nodis} : Create a new nodi.
     *
     * @param nodi the nodi to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new nodi, or with status {@code 400 (Bad Request)} if the nodi has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/nodis")
    public ResponseEntity<Nodi> createNodi(@RequestBody Nodi nodi) throws URISyntaxException {
        log.debug("REST request to save Nodi : {}", nodi);
        if (nodi.getId() != null) {
            throw new BadRequestAlertException("A new nodi cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Nodi result = nodiRepository.save(nodi);
        return ResponseEntity
            .created(new URI("/api/nodis/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /nodis/:id} : Updates an existing nodi.
     *
     * @param id the id of the nodi to save.
     * @param nodi the nodi to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated nodi,
     * or with status {@code 400 (Bad Request)} if the nodi is not valid,
     * or with status {@code 500 (Internal Server Error)} if the nodi couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/nodis/{id}")
    public ResponseEntity<Nodi> updateNodi(@PathVariable(value = "id", required = false) final Long id, @RequestBody Nodi nodi)
        throws URISyntaxException {
        log.debug("REST request to update Nodi : {}, {}", id, nodi);
        if (nodi.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, nodi.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!nodiRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Nodi result = nodiRepository.save(nodi);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, nodi.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /nodis/:id} : Partial updates given fields of an existing nodi, field will ignore if it is null
     *
     * @param id the id of the nodi to save.
     * @param nodi the nodi to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated nodi,
     * or with status {@code 400 (Bad Request)} if the nodi is not valid,
     * or with status {@code 404 (Not Found)} if the nodi is not found,
     * or with status {@code 500 (Internal Server Error)} if the nodi couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/nodis/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Nodi> partialUpdateNodi(@PathVariable(value = "id", required = false) final Long id, @RequestBody Nodi nodi)
        throws URISyntaxException {
        log.debug("REST request to partial update Nodi partially : {}, {}", id, nodi);
        if (nodi.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, nodi.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!nodiRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Nodi> result = nodiRepository
            .findById(nodi.getId())
            .map(existingNodi -> {
                if (nodi.getField1() != null) {
                    existingNodi.setField1(nodi.getField1());
                }

                return existingNodi;
            })
            .map(nodiRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, nodi.getId().toString())
        );
    }

    /**
     * {@code GET  /nodis} : get all the nodis.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of nodis in body.
     */
    @GetMapping("/nodis")
    public List<Nodi> getAllNodis() {
        log.debug("REST request to get all Nodis");
        return nodiRepository.findAll();
    }

    /**
     * {@code GET  /nodis/:id} : get the "id" nodi.
     *
     * @param id the id of the nodi to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the nodi, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/nodis/{id}")
    public ResponseEntity<Nodi> getNodi(@PathVariable Long id) {
        log.debug("REST request to get Nodi : {}", id);
        Optional<Nodi> nodi = nodiRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(nodi);
    }

    /**
     * {@code DELETE  /nodis/:id} : delete the "id" nodi.
     *
     * @param id the id of the nodi to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/nodis/{id}")
    public ResponseEntity<Void> deleteNodi(@PathVariable Long id) {
        log.debug("REST request to delete Nodi : {}", id);
        nodiRepository.deleteById(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
