package com.back.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Redirige todas las rutas que no contienen punto (.) a index.html
        registry.addViewController("/{path:[^\\.]*}")
                .setViewName("forward:/index.html");

        registry.addViewController("/**/{path:[^\\.]*}")
                .setViewName("forward:/index.html");

        registry.addViewController("/asist/login")
                .setViewName("forward:/index.html");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/");

        registry.addResourceHandler("/favicon.svg")
                .addResourceLocations("classpath:/static/favicon.svg");

        registry.addResourceHandler("/**/*.js", "/**/*.css", "/**/*.svg", "/**/*.png")
                .addResourceLocations("classpath:/static/");
    }
}
