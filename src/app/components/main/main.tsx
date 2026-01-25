import styles from "./main.module.css";

export default function Main() {
  return (
    <div className={styles.main}>
      {/* Секция с заголовком */}
      <section className={styles.titleSection}>
        <h1 className={styles.mainTitle}>
          Начните заниматься спортом и улучшите качество жизни
        </h1>
        <div className={styles.promoContainer}>
          <div className={styles.promoBanner}>
            <p className={styles.promoText}>
              Измени своё
              <br />
              тело за полгода!
            </p>
          </div>
          <svg
            className={styles.polygonIcon}
            width="31"
            height="36"
            viewBox="0 0 31 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.25285 34.7255C1.65097 35.9972 -0.601266 34.3288 0.148526 32.4259L12.4256 1.26757C12.9078 0.043736 14.4198 -0.389332 15.4768 0.393651L29.4288 10.7288C30.4858 11.5118 30.5121 13.0844 29.4819 13.9023L3.25285 34.7255Z"
              fill="#BCEC30"
            />
          </svg>
        </div>
      </section>

      {/* Секция с курсами */}
      <section className={styles.courses}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Наши программы</h2>
          <div className={styles.coursesGrid}>
            {/* Здесь будут карточки курсов */}
            <p className={styles.placeholder}>Список курсов будет здесь</p>
          </div>
        </div>
      </section>

      {/* Секция преимуществ */}
      <section className={styles.features}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Почему выбирают нас</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.feature}>
              <h3>Персональный подход</h3>
              <p>Программы, адаптированные под ваши цели</p>
            </div>
            <div className={styles.feature}>
              <h3>Отслеживание прогресса</h3>
              <p>Мониторинг ваших достижений в реальном времени</p>
            </div>
            <div className={styles.feature}>
              <h3>Профессиональные тренеры</h3>
              <p>Опытные специалисты помогут достичь результата</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
