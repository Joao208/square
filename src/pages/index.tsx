import { RoomProvider } from "liveblocks.config";
import { ClientSideSuspense } from "@liveblocks/react";
import { Flow } from "@/components/flow";
import { LiveList, LiveObject } from "@liveblocks/client";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

function slugGenerator(roomName: string) {
  const slug = roomName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  return slug;
}

function Loading() {
  return (
    <div className="flex items-center justify-center h-screen w-screen">
      Carregando...
    </div>
  );
}

export default function Index() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const themeInLocalStorageIsDark = localStorage.theme === "dark";

    const notFoundInLocalStorage = !("theme" in localStorage);
    const isDarkInMediaQuery =
      notFoundInLocalStorage &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (isDarkInMediaQuery || themeInLocalStorageIsDark) {
      document.documentElement.classList.add("dark");

      return setTheme("dark");
    }

    setTheme("light");

    return document.documentElement.classList.remove("dark");
  }, [theme]);

  const { query, replace } = useRouter();

  const [roomId, setRoomId] = useState<string>(query.roomId as string);
  const [name, setName] = useState<string>(query.name as string);
  const [nameInLocalStorage, setNameInLocalStorage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const handleClick = useCallback(
    async (e: any) => {
      e.preventDefault();

      replace(
        `/?roomId=${slugGenerator(
          roomId || (query.roomId as string)
        )}&name=${name}`
      );
    },
    [name, roomId, replace, query]
  );

  useEffect(() => {
    setNameInLocalStorage(localStorage.getItem("name")!);

    setLoading(false);
  }, []);

  if (loading) {
    return <Loading />;
  }

  if ((!query.name && !nameInLocalStorage) || !query.roomId) {
    return (
      <form
        onSubmit={handleClick}
        className="flex gap-5 flex-col w-screen h-screen items-center align-center justify-center bg-purple-50 dark:bg-[#1B1E1F]"
      >
        <input
          onChange={(e) => {
            setName(e.target.value);
          }}
          value={name || query.name || ""}
          placeholder="Seu nome"
          className="p-2 border-purple-400 dark:border-purple-100 border-2 outline-none rounded-md max-w-[90%] w-[400px] h-[50px] bg-inherit dark:text-white"
        />

        <input
          onChange={(e) => {
            setRoomId(e.target.value);
          }}
          value={roomId || query.roomId}
          placeholder="Como você gostaria de nomear sua sala?"
          autoCapitalize="none"
          className="p-2 border-purple-400 dark:border-purple-100 border-2 outline-none rounded-md max-w-[90%] w-[400px] h-[50px] bg-inherit dark:text-white"
        />

        <button className="p-2 bg-purple-400 dark:bg-purple-100 rounded-md max-w-[90%] w-[400px] h-[50px]">
          Entrar
        </button>
      </form>
    );
  }

  return (
    <>
      <RoomProvider
        id={query.roomId as string}
        initialStorage={{
          flow: new LiveObject({
            nodes: new LiveList(),
            edges: new LiveList(),
          }),
          colorByConnectionIds: new LiveObject({}),
        }}
        initialPresence={{
          cursor: { x: 256, y: 367 },
        }}
      >
        <ClientSideSuspense fallback={<Loading />}>
          {() => <Flow theme={theme} setTheme={setTheme} />}
        </ClientSideSuspense>
      </RoomProvider>
    </>
  );
}
