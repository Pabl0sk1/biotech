import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Documentación del Sistema Biotech',
    Svg: require('@site/static/img/biotech.svg').default,
    description: <>Toda la documentación técnica de tu API en un solo lugar.</>,
  },
  {
    title: 'Arquitectura Completa',
    Svg: require('@site/static/img/database.svg').default,
    description: <>Backend en Spring Boot, base de datos PostgreSQL y frontend React.</>,
  },
  {
    title: 'Endpoints Claros y Organizados',
    Svg: require('@site/static/img/api.svg').default,
    description: <>Consulta cada módulo y sus endpoints con ejemplos reales.</>,
  },
];


function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
