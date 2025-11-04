package com.back.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.zip.DataFormatException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.back.entity.Configuracion;
import com.back.repository.ConfiguracionRepository;
import com.back.util.ImageUtils;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ConfiguracionService {

	@Autowired
	ConfiguracionRepository rep;
	
	ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
	Validator validator = factory.getValidator();
	
	public List<Configuracion> listar() {
		List<Configuracion> result = new ArrayList<Configuracion>();
		rep.findAll().forEach(result::add);
		return result;
	}
	
	public Configuracion guardar(Configuracion config) {
		Set<ConstraintViolation<Configuracion>> violations = validator.validate(config);
		String errorValidation = "";
		for (ConstraintViolation<Configuracion> cv : violations) {
			errorValidation += "Error " + cv.getPropertyPath() + " " + cv.getMessage();
		}
		if (!violations.isEmpty()) {
			throw new RuntimeException(errorValidation);
		}
		return rep.save(config);
	}

	public Configuracion buscarPorId(Integer id) {
		Optional<Configuracion> cfg = rep.findById(id);
		if (cfg.isPresent()) {
			Configuracion config = cfg.get();
	        try {
	            if (config.getImagen() != null) {
	                // Descomprime la imagen solo si existe
	                try {
	                    byte[] decompressedData = ImageUtils.decompressImage(config.getImagen());
	                    // Convierte a Base64
	                    String base64Image = Base64.getEncoder().encodeToString(decompressedData);
	                    config.setBase64imagen(base64Image);
	                } catch (IOException | DataFormatException e) {
	                    // Si hay error al descomprimir, intentar usar la imagen tal cual
	                    String base64Image = Base64.getEncoder().encodeToString(config.getImagen());
	                    config.setBase64imagen(base64Image);
	                }
	            }
	            return config;
	        } catch (Exception e) {
	            // Si ocurre cualquier otro error, devolver el producto sin la imagen en base64
	        	config.setBase64imagen(null);
	            return config;
	        }
	    } else {
	        throw new RuntimeException("No se encontró la configuración");
	    }
	}
	
	public Page<Configuracion> listarTodos(Pageable pageable) {
	    Page<Configuracion> cfg = rep.findAll(pageable);
	    for (Configuracion config : cfg) {
	        if (config.getImagen() != null) { 
	            try {
	                byte[] decompressedData = ImageUtils.decompressImage(config.getImagen());
	                String base64Image = Base64.getEncoder().encodeToString(decompressedData);
	                config.setBase64imagen(base64Image);
	            } catch (DataFormatException e) { 
	                // Captura la DataFormatException específicamente
	                try {
	                    byte[] originalData = config.getImagen();
	                    String base64Image = Base64.getEncoder().encodeToString(originalData);
	                    config.setBase64imagen(base64Image);
	                } catch (Exception ex) {
	                    // Maneja la excepción de codificación de la imagen original
	                    throw new RuntimeException("Error al codificar la imagen original: " + ex.getMessage(), ex);
	                }
	            } catch (IOException e) {
	                // Maneja otras excepciones de E/S
	                throw new RuntimeException("Error de E/S al procesar la imagen: " + e.getMessage(), e);
	            }
	        }
	    }
	    return cfg;
	}
	
}
