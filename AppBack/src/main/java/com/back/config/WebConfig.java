package com.back.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/{path:[^\\.]*}")
                .setViewName("forward:/biotech/index.html");

        registry.addViewController("/**/{path:[^\\.]*}")
                .setViewName("forward:/biotech/index.html");

        registry.addViewController("/biotech/login")
                .setViewName("forward:/biotech/index.html");
        
        registry.addViewController("/docs/**")
        		.setViewName("forward:/docs/index.html");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/biotech/**")
                .addResourceLocations("classpath:/static/biotech/");
        
        registry.addResourceHandler("/docs/**")
        		.addResourceLocations("classpath:/static/docs/");

        registry.addResourceHandler("/**/*.js", "/**/*.css", "/**/*.svg", "/**/*.png")
                .addResourceLocations("classpath:/static/");
    }
}
