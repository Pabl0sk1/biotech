package com.back.config;

import java.nio.file.Paths;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class FileStorageConfig implements WebMvcConfigurer {
	
	@Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
		String path = Paths.get("src/main/resources/logo/").toAbsolutePath().toUri().toString();

        registry.addResourceHandler("/logo/**")
                .addResourceLocations(path);
    }

}
