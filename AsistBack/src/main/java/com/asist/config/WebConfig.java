package com.asist.config;

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

        registry.addViewController("/asistpro/login")
                .setViewName("forward:/index.html");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/");

        registry.addResourceHandler("/icon.svg")
                .addResourceLocations("classpath:/static/icon.svg");

        registry.addResourceHandler("/**/*.js", "/**/*.css", "/**/*.svg", "/**/*.png")
                .addResourceLocations("classpath:/static/");
    }
}
