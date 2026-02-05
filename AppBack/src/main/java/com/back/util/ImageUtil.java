package com.back.util;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;

public class ImageUtil {
	
	public static String guardarImagen(MultipartFile archivo, String ruta) throws Exception {
	    String folder = "uploads" + ruta;
	    File dir = new File(folder);
	    if (!dir.exists()) dir.mkdirs();

	    String filename = UUID.randomUUID() + "_" + archivo.getOriginalFilename();
	    Path path = Paths.get(folder + filename);

	    Files.write(path, archivo.getBytes());

	    return ruta + filename;
	}
	
	public static void eliminarImagen(String ruta) throws Exception {
	    Path path = Paths.get("uploads" + ruta);
	    Files.deleteIfExists(path);
	}

}
