package com.back.github;

import java.nio.charset.StandardCharsets;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import com.fasterxml.jackson.databind.ObjectMapper;

public class GitHubSignatureValidator {
	
	public static boolean isValid(String signatureHeader, String secret, Map<String,Object> payload) throws Exception {
        String payloadJson = new ObjectMapper().writeValueAsString(payload);
        Mac hmac = Mac.getInstance("HmacSHA256");
        hmac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hash = hmac.doFinal(payloadJson.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for(byte b : hash) sb.append(String.format("%02x", b));
        String computed = "sha256=" + sb.toString();
        return computed.equals(signatureHeader);
    }

}
