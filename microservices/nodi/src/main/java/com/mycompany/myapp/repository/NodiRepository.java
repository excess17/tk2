package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Nodi;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Nodi entity.
 */
@SuppressWarnings("unused")
@Repository
public interface NodiRepository extends JpaRepository<Nodi, Long> {}
