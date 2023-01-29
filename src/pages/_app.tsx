import "dist/main.css";
import { NextSeo } from "next-seo";
import type { AppProps } from "next/app";
import Head from "next/head";
import { ToastContainer } from "react-toastify";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="theme-color" className="bg-white darg:bg-[#5D5D5D]" />

        <link rel="shortcut icon" href="square.svg" />

        <title>Square</title>

        <NextSeo
          title="Square"
          description="Descubra a arte do minimalismo com o Square - O site para simplificar sua vida"
          openGraph={{
            url: "mudar",
            title: "Square",
            description:
              "Descubra a arte do minimalismo com o Square - O site para simplificar sua vida",
            images: [
              {
                url: "/dark-mode-print.png",
                width: 800,
                height: 600,
                alt: "Minimalist Print Dark Mode",
                type: "image/png",
              },
              {
                url: "/light-mode-print.png",
                width: 800,
                height: 600,
                alt: "Minimalist Print Light Mode",
                type: "image/png",
              },
            ],
            siteName: "Square",
          }}
        />
      </Head>
      <Component {...pageProps} />
      <ToastContainer />
    </>
  );
}
