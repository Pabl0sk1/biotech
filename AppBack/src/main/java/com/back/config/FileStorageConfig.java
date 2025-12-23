package com.back.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class FileStorageConfig implements WebMvcConfigurer {
	
	@Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        registry.addResourceHandler("/logo/**")
                .addResourceLocations("file:uploads/logo/");
        
        registry.addResourceHandler("/profilepic/**")
        		.addResourceLocations("file:uploads/profilepic/");
    }

}
