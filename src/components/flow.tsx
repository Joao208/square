import "reactflow/dist/style.css";

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as Toolbar from "@radix-ui/react-toolbar";
import ReactFlow, {
  addEdge,
  Connection,
  Controls,
  Background,
  Node,
  ConnectionMode,
  NodeChange,
  EdgeChange,
} from "reactflow";
import { Square } from "@/components/nodes/square";
import DefaultEdge from "@/components/edges/default";
import {
  useMutation,
  useOthers,
  useRoom,
  useSelf,
  useStorage,
  useUpdateMyPresence,
} from "liveblocks.config";
import Image from "next/image";
import { useRouter } from "next/router";
import { Text } from "@/components/nodes/text";
import Sun from "../../public/sun.svg";
import Moon from "../../public/moon.svg";
import Share from "../../public/share.svg";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function randomUUID() {
  return Math.random().toString(36).substring(7);
}

function randomTailwindColor(darkMode: boolean): string {
  const lightColors = [
    "#ff0000",
    "#ffff00",
    "#00ff00",
    "#00ffff",
    "#0000ff",
    "#ff00ff",
  ];
  const darkColors = [
    "#8b0000",
    "#b8860b",
    "#006400",
    "#008080",
    "#00008b",
    "#8b008b",
  ];
  const colors = darkMode ? darkColors : lightColors;
  return colors[Math.floor(Math.random() * colors.length)];
}

function Cursor({
  x,
  y,
  bgColor,
  name,
}: {
  x: number;
  y: number;
  bgColor: string;
  name: string;
}) {
  return (
    <div
      style={{
        width: "fit-content",
        transform: `translate(${x}px, ${y}px)`,
        position: "absolute",
        zIndex: 999,
      }}
      className="flex items-center justify-center gap-2"
    >
      <div
        style={{
          backgroundColor: bgColor,
        }}
        className={`w-5 h-5 rounded-tl-full rounded-tr-full rounded-br-full transition-all`}
      />
      <p
        style={{
          backgroundColor: bgColor,
        }}
        className="rounded-md text-white px-2 py-1"
      >
        {name}
      </p>
    </div>
  );
}

export function Flow({
  setTheme,
  theme,
}: {
  theme: string;
  setTheme: Dispatch<SetStateAction<"dark" | "light">>;
}) {
  const [peopleOnline, setPeopleOnline] = useState<
    {
      id: number;
      name: string;
      online: boolean;
    }[]
  >([]);
  const { query, replace } = useRouter();
  const coisas = useRoom();

  coisas.events.others.subscribe(({ event }) => {
    if (event.type === "leave") {
      setPeopleOnline((prev) => {
        const newPeopleOnline = [...prev];

        const found = newPeopleOnline.find(
          (p) => p.id === event.user.connectionId
        );

        if (found) {
          found.online = false;
        }

        return newPeopleOnline;
      });

      setTimeout(() => {
        setPeopleOnline((prev) => {
          const newPeopleOnline = [...prev];

          newPeopleOnline.splice(
            newPeopleOnline.findIndex((p) => p.id === event.user.connectionId),
            1
          );

          return newPeopleOnline;
        });
      }, 120_000);
    }

    if (event.type === "enter" || event.type === "update") {
      setPeopleOnline((prev) => {
        const newPeopleOnline = [...prev];

        const alreadyExit = newPeopleOnline.find(
          (p) => p.id === event.user.connectionId
        );

        if (alreadyExit) {
          alreadyExit.online = true;

          return newPeopleOnline;
        }

        newPeopleOnline.push({
          id: event.user.connectionId,
          name: event.user.presence.name as string,
          online: true,
        });

        return newPeopleOnline;
      });
    }
  });

  const NODE_TYPES = useMemo(
    () => ({
      square: Square,
      text: Text,
    }),
    []
  );

  const EDGE_TYPES = useMemo(
    () => ({
      default: DefaultEdge,
    }),
    []
  );

  const storageColorByConnectionIds = useStorage(
    (root) => root.colorByConnectionIds
  ) as any;

  const storageFlow = useStorage((root) => root.flow) as any;

  const others = useOthers();
  const self = useSelf();

  const addColorByConnectionId = useMutation(({ storage }, connectionId) => {
    const mutableColorByConnectionIds = storage.get(
      "colorByConnectionIds"
    ) as unknown as any;

    mutableColorByConnectionIds.set(
      connectionId,
      randomTailwindColor(theme === "dark")
    );
  }, []);

  const addMutableNode = useMutation(({ storage }, node) => {
    const mutableFlow = storage.get("flow") as unknown as any;

    const foundMutableNode = mutableFlow
      .get("nodes")
      .find((n: any) => n.id === node.id);

    if (foundMutableNode) return;

    mutableFlow.get("nodes").push(node);
  }, []);

  const removeMutableNode = useMutation(({ storage }, node) => {
    const mutableFlow = storage.get("flow") as unknown as any;

    const mutableNodeIndex = mutableFlow
      .get("nodes")
      .findIndex((n: any) => n.id === node.id);

    if (mutableNodeIndex === -1) return;

    mutableFlow.get("nodes").delete(mutableNodeIndex);
  }, []);

  const updateMutableNode = useMutation(({ storage, self }, node) => {
    const mutableFlow = storage.get("flow") as unknown as any;

    const mutableNodeIndex = mutableFlow
      .get("nodes")
      .findIndex((n: any) => n.id === node.id);

    if (mutableNodeIndex === -1) return;

    const mutableNodeSnapshot = mutableFlow.get("nodes").get(mutableNodeIndex);

    if (node.text) {
      mutableFlow.get("nodes").set(mutableNodeIndex, {
        ...mutableNodeSnapshot,
        ...node,
        data: {
          ...mutableNodeSnapshot.data,
          ...node.data,
          selectedBy: self.connectionId,
          text: node.text,
        },
      });

      return;
    }

    if (node.selected) {
      mutableFlow.get("nodes").set(mutableNodeIndex, {
        ...mutableNodeSnapshot,
        ...node,
        data: {
          ...mutableNodeSnapshot.data,
          ...node.data,
          selectedBy: self.connectionId,
        },
      });

      return;
    }

    mutableFlow.get("nodes").set(mutableNodeIndex, {
      ...mutableNodeSnapshot,
      ...node,
    });
  }, []);

  const addMutableEdge = useMutation(({ storage }, edge) => {
    const mutableFlow = storage.get("flow") as unknown as any;

    const foundMutableNode = mutableFlow
      .get("edges")
      .find((n: any) => n.id === edge.id);

    if (foundMutableNode) return;

    mutableFlow.get("edges").push(edge);
  }, []);

  const removeMutableEdge = useMutation(({ storage }, edge) => {
    const mutableFlow = storage.get("flow") as unknown as any;

    const mutableEdgeIndex = mutableFlow
      .get("edges")
      .findIndex((n: any) => n.id === edge.id);

    if (mutableEdgeIndex === -1) return;

    mutableFlow.get("edges").delete(mutableEdgeIndex);
  }, []);

  const updateMutableEdges = useMutation(({ storage }, edge) => {
    const mutableFlow = storage.get("flow") as unknown as any;

    const mutableEdgeIndex = mutableFlow
      .get("edges")
      .findIndex((n: any) => n.id === edge.id);

    if (mutableEdgeIndex === -1) return;

    const mutableNodeSnapshot = mutableFlow.get("nodes").get(mutableEdgeIndex);

    mutableFlow.get("edges").set(mutableEdgeIndex, {
      ...mutableNodeSnapshot,
      ...edge,
    });
  }, []);

  const othersWithInfo = others.map((other) => {
    if (!storageColorByConnectionIds[other.connectionId]) {
      addColorByConnectionId(other.connectionId);
    }

    return {
      ...other,
      color: storageColorByConnectionIds[other.connectionId],
    };
  });

  const updateMyPresence = useUpdateMyPresence();

  useEffect(() => {
    if (!query.name) return;

    updateMyPresence({
      name: query.name,
    });

    localStorage.setItem("name", query.name as string);
  }, [query, updateMyPresence, replace]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = addEdge(params, []);

      addMutableEdge(newEdge[0]);
    },
    [addMutableEdge]
  );

  const onChangeNodeText = useCallback(
    ({ id, text }: { id: string; text: string }) => {
      return updateMutableNode({
        id,
        text,
      });
    },
    [updateMutableNode]
  );

  const getTheBestPositionToNewNode = useCallback((nodes: Node[]) => {
    if (nodes.length === 0) return { x: 200, y: 200 };

    const maxX = Math.max(...nodes.map((n) => n.position.x));
    const maxY = Math.max(...nodes.map((n) => n.position.y));

    return {
      x: maxX + 300,
      y: maxY,
    };
  }, []);

  const addNode = useCallback(
    (type: string = "square") => {
      const { x, y } = getTheBestPositionToNewNode(storageFlow.nodes);

      const newNode: Node = {
        id: randomUUID(),
        type: type,
        position: { x, y },
        data: {
          onChange: onChangeNodeText,
          text: "",
        },
        ...(type === "text" && {
          selected: true,
        }),
      };

      addMutableNode(newNode);
    },
    [addMutableNode, onChangeNodeText, getTheBestPositionToNewNode, storageFlow]
  );

  const onNodeChange = useCallback(
    (params: NodeChange[]) => {
      for (const param of params) {
        if (param.type === "add") {
          continue;
        }

        if (param.type === "dimensions") {
          if (!param.dimensions || !param.resizing) continue;

          updateMutableNode({
            id: param.id,
            dimensions: param.dimensions,
            resizing: param.resizing,
            updateStyle: param.updateStyle,
          });
        }

        if (param.type === "position") {
          if (!param.positionAbsolute || !param.position) continue;

          updateMutableNode({
            id: param.id,
            position: param.position,
            positionAbsolute: param.positionAbsolute,
          });
        }

        if (param.type === "remove") {
          removeMutableNode({ id: param.id });
        }

        if (param.type === "select") {
          updateMutableNode({
            id: param.id,
            selected: param.selected,
          });
        }

        if (param.type === "reset") {
          updateMutableNode({
            ...param.item,
          });
        }
      }
    },
    [updateMutableNode, removeMutableNode]
  );

  const onEdgesChange = useCallback(
    (params: EdgeChange[]) => {
      for (const param of params) {
        if (param.type === "add") {
          continue;
        }

        if (param.type === "reset") {
          updateMutableEdges({
            ...param.item,
          });
        }

        if (param.type === "remove") {
          removeMutableEdge({
            id: param.id,
          });
        }

        if (param.type === "select") {
          updateMutableEdges({
            id: param.id,
            selected: param.selected,
          });
        }
      }
    },
    [updateMutableEdges, removeMutableEdge]
  );

  return (
    <div
      className="w-screen h-screen"
      onPointerMove={(e) =>
        updateMyPresence({ cursor: { x: e.clientX, y: e.clientY } })
      }
    >
      <ReactFlow
        nodes={storageFlow.nodes}
        edges={storageFlow.edges}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        onNodesChange={onNodeChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        connectionMode={ConnectionMode.Loose}
      >
        <Controls className="md:block hidden" />
        <Background
          gap={16}
          size={2}
          color={theme === "dark" ? "#455154" : "#ddd"}
          className="bg-purple-50 dark:bg-[#1B1E1F]"
        />

        {othersWithInfo.map(({ connectionId, presence, color }: any) => {
          return (
            presence.cursor && (
              <Cursor
                key={connectionId}
                x={presence.cursor.x}
                y={presence.cursor.y}
                bgColor={color}
                name={presence.name}
              />
            )
          );
        })}
      </ReactFlow>

      <Toolbar.Root className="fixed bottom-5 h-20 left-1/2 -translate-x-1/2 bg-white dark:bg-[#5D5D5D] shadow-lg w-content rounded-md px-10 flex items-center overflow-hidden">
        <Toolbar.Button
          className="bg-purple-400 dark:bg-purple-100 w-32 h-20 translate-y-5 hover:translate-y-2 transition-transform"
          onClick={() => addNode()}
        />
        <Toolbar.Separator className="bg-gray-100 w-0.5 mx-5 h-[80%]" />
        <Toolbar.Button
          onClick={() => addNode("text")}
          className="border-black w-16 h-16 border-2 dark:border-white"
        >
          <p className="text-3xl font-light dark:text-white">T</p>
        </Toolbar.Button>
      </Toolbar.Root>

      <Toolbar.Root className="fixed top-5 h-12 right-10 bg-white dark:bg-[#5D5D5D] shadow-lg w-content rounded-md px-2 overflow-hidden flex flex-row-reverse items-center gap-2">
        {[
          {
            id: self.connectionId,
            name: self.presence.name,
            online: true,
          },
          ...peopleOnline,
        ].map(({ name, id, online }) => (
          <div
            style={{
              borderColor: storageColorByConnectionIds[id],
              borderWidth: 2,
            }}
            className="w-10 h-10 relative rounded-full"
            key={id}
          >
            <Image
              loader={() =>
                `https://api.dicebear.com/5.x/lorelei/svg?seed=${id}`
              }
              fill
              src={`https://api.dicebear.com/5.x/lorelei/svg?seed=${id}`}
              alt={name as unknown as string}
            />
            <div
              id="online-indicator"
              style={{
                backgroundColor: storageColorByConnectionIds[id],
                display: !online ? "none" : "block",
              }}
              className="rounded-full w-2 h-2 absolute bottom-0 right-0"
            />
          </div>
        ))}
      </Toolbar.Root>

      <Toolbar.Root className="fixed top-5 h-12 left-10 bg-white dark:bg-[#5D5D5D] shadow-lg w-content rounded-md px-2 overflow-hidden flex flex-row items-center gap-2">
        {theme === "dark" ? (
          <Toolbar.Button
            onClick={() => {
              localStorage.theme = "light";
              setTheme("light");
            }}
          >
            <Sun />
          </Toolbar.Button>
        ) : (
          <Toolbar.Button
            onClick={() => {
              localStorage.theme = "dark";
              setTheme("dark");
            }}
          >
            <Moon />
          </Toolbar.Button>
        )}
        <Toolbar.Separator className="bg-gray-100 w-0.5 mx-2 h-[80%]" />
        <Toolbar.Button
          onClick={() => {
            navigator.clipboard.writeText(
              window.location.href.replace(new RegExp(`&name=[^&#]+`), "")
            );

            toast("Link copiado!", {
              position: "top-center",
              autoClose: 2000,
              hideProgressBar: true,
              closeOnClick: true,
              theme: theme === "dark" ? "dark" : "light",
            });
          }}
        >
          <Share stroke={theme === "dark" ? "#fff" : "#000"} />
        </Toolbar.Button>
      </Toolbar.Root>
    </div>
  );
}
