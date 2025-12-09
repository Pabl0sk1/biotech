package com.back.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import com.back.service.TokenService;

@Component
public class CronScheduler {

	@Autowired
	TokenService servT;
	
	@Scheduled(cron = "0 0 0 * * ?")
	public void revisarTokensExpirados() {
		servT.actualizarTokensExpirados();
	}
	
}
