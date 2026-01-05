package com.back.config;

import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class SpecificationBuilder {

    public static <T> Specification<T> build(String filterClause) {
        if (filterClause == null || filterClause.isBlank()) {
            return (root, query, cb) -> cb.conjunction();
        }

        List<Filter> filters = parseFilters(filterClause);

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            for (Filter f : filters) {
                Path<?> path;
                
                if (f.field.contains(".")) {
                    String[] parts = f.field.split("\\.");

                    jakarta.persistence.criteria.From<?,?> join = root;

                    for (int i = 0; i < parts.length - 1; i++) {
                        join = join.join(parts[i]);
                    }

                    path = join.get(parts[parts.length - 1]);

                } else {
                    path = root.get(f.field);
                }
                
                Class<?> fieldType = path.getJavaType();

                switch (f.op) {

                    case "contains":
                        predicates.add(cb.like(
                                cb.lower(path.as(String.class)),
                                "%" + f.value.toLowerCase() + "%"
                        ));
                        break;

                    case "starts":
                        predicates.add(cb.like(
                                cb.lower(path.as(String.class)),
                                f.value.toLowerCase() + "%"
                        ));
                        break;

                    case "ends":
                        predicates.add(cb.like(
                                cb.lower(path.as(String.class)),
                                "%" + f.value.toLowerCase()
                        ));
                        break;

                    case "eq":
                    	if (fieldType.equals(String.class)) {
                            predicates.add(
                                cb.equal(
                                    cb.lower(path.as(String.class)),
                                    f.value.toLowerCase()
                                )
                            );
                        } else {
                            predicates.add(cb.equal(path, f.valueComparable(fieldType)));
                        }
                        break;

                    case "neq":
                    	if (fieldType.equals(String.class)) {
                            predicates.add(
                                cb.notEqual(
                                    cb.lower(path.as(String.class)),
                                    f.value.toLowerCase()
                                )
                            );
                        } else {
                            predicates.add(cb.notEqual(path, f.valueComparable(fieldType)));
                        }
                        break;

                    case "gt":
                    case "gte":
                    case "lt":
                    case "lte":
                    case "between": {

                        if (!Comparable.class.isAssignableFrom(fieldType)) {
                            throw new IllegalArgumentException(
                                    "El campo " + f.field + " no es comparable (tipo: " + fieldType + ")"
                            );
                        }

                        Expression<? extends Comparable> exp = (Expression<? extends Comparable>) path;
                        Comparable v1 = f.valueComparable(fieldType);

                        switch (f.op) {
                            case "gt":
                                predicates.add(cb.greaterThan(exp, v1));
                                break;

                            case "gte":
                                predicates.add(cb.greaterThanOrEqualTo(exp, v1));
                                break;

                            case "lt":
                                predicates.add(cb.lessThan(exp, v1));
                                break;

                            case "lte":
                                predicates.add(cb.lessThanOrEqualTo(exp, v1));
                                break;

                            case "between":
                                Comparable v2 = f.valueComparable2(fieldType);
                                predicates.add(cb.between(exp, v1, v2));
                                break;
                        }
                        break;
                    }
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static List<Filter> parseFilters(String clause) {
        List<Filter> list = new ArrayList<>();

        for (String part : clause.split(";")) {
            String[] p = part.split(":");
            Filter f = new Filter();
            f.field = p[0];
            f.op = p[1];
            f.value = p[2];

            if (f.op.equals("between")) {
                String[] vals = f.value.split("\\.\\.");
                f.value = vals[0];
                f.value2 = vals[1];
            }

            list.add(f);
        }

        return list;
    }

    static class Filter {
        String field;
        String op;
        String value;
        String value2;

        Comparable<?> valueComparable(Class<?> fieldType) {
            return castToRequiredType(fieldType, value);
        }

        Comparable<?> valueComparable2(Class<?> fieldType) {
            return castToRequiredType(fieldType, value2);
        }
    }

    private static Comparable<?> castToRequiredType(Class<?> fieldType, String value) {
        if (fieldType.equals(Integer.class) || fieldType.equals(int.class)) {
            return Integer.valueOf(value);
        }
        if (fieldType.equals(Long.class) || fieldType.equals(long.class)) {
            return Long.valueOf(value);
        }
        if (fieldType.equals(Double.class) || fieldType.equals(double.class)) {
            return Double.valueOf(value);
        }
        if (fieldType.equals(Float.class) || fieldType.equals(float.class)) {
            return Float.valueOf(value);
        }
        if (fieldType.equals(Boolean.class) || fieldType.equals(boolean.class)) {
            String v = value.trim().toLowerCase();
            if (v.equals("true") || v.equals("1") || v.equals("si") || v.equals("yes")) {
                return true;
            }
            if (v.equals("false") || v.equals("0") || v.equals("no")) {
                return false;
            }
            throw new IllegalArgumentException("Valor booleano inválido: " + value);
        }
        if (fieldType.equals(LocalDate.class)) {
            return LocalDate.parse(value, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        }
        
        return value;
    }

}
