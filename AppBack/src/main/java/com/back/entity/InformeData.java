package com.back.entity;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "informedatas")
public class InformeData {
	
	@Id 
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "informedata_sec")
	@SequenceGenerator(name = "informedata_sec", sequenceName = "informedatas_id_seq", allocationSize = 1)
	private Integer id;
	
	@Lob
	@JdbcTypeCode(SqlTypes.BINARY)
    @Column(name = "data")
    private byte[] data;
	
	@OneToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "informe_id", nullable = false, unique = true)
    private Informe informe;
    
    public InformeData(Integer id) {
		super();
		this.id = id;
	}

}
