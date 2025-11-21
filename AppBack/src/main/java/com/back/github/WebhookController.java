package com.back.github;

import java.io.IOException;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WebhookController {
	
	@Value("${WEBHOOK_SECRET}")
    private String webhookSecret;

    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(
            @RequestHeader("X-Hub-Signature-256") String signature,
            @RequestBody Map<String,Object> payload) {

        // Validar push a main
        String ref = (String) payload.get("ref");
        if(!"refs/heads/main".equals(ref)) {
            return ResponseEntity.ok("Push a otra rama, no se despliega");
        }

        // Validar signature (HMAC SHA256)
        try {
            if(!GitHubSignatureValidator.isValid(signature, webhookSecret, payload)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Secret inválido");
            }
        } catch(Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error validando signature");
        }

        // Ejecutar script de deploy
        try {
            ProcessBuilder pb = new ProcessBuilder("/home/bioadmin/deploy_biotech.sh");
            pb.inheritIO();
            Process p = pb.start();
            p.waitFor();
            return ResponseEntity.ok("Deploy ejecutado correctamente");
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("Error al ejecutar deploy: " + e.getMessage());
        }
    }

}
