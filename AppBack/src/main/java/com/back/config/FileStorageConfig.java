package com.back.config;

import java.nio.file.Paths;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class FileStorageConfig implements WebMvcConfigurer {
	
	@Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
		String logoPath = Paths.get("src/main/resources/logo/").toAbsolutePath().toUri().toString();
		String profilepicPath = Paths.get("src/main/resources/profilepic/").toAbsolutePath().toUri().toString();

        registry.addResourceHandler("/logo/**")
                .addResourceLocations(logoPath);
        
        registry.addResourceHandler("/profilepic/**")
        		.addResourceLocations(profilepicPath);
    }

}
