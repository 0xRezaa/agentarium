import styles from "./home.module.css";

export function meta() {
  return [
    { title: "Chat Assistant" },
    {
      name: "description",
      content: "A simple browser-native chat assistant is coming soon.",
    },
  ];
}

export default function Home() {
  return (
    <main className={styles["placeholder"]}>
      <h1 className={styles["title"]}>Chat Assistant</h1>
      <p className={styles["description"]}>
        A simple browser-native chat assistant is coming soon.
      </p>
    </main>
  );
}
