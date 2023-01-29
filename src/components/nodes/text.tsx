import "@reactflow/node-resizer/dist/style.css";

import { NodeResizer } from "@reactflow/node-resizer";
import { Handle, NodeProps, Position } from "reactflow";
import { useEffect, useState } from "react";
import { useOthers, useSelf, useStorage } from "liveblocks.config";

export function Text({ selected, data, id }: NodeProps) {
  const { onChange = () => {}, text = "", selectedBy } = data;

  const [color, setColor] = useState("");
  const [name, setName] = useState("");

  const storageColorByConnectionIds = useStorage(
    (root) => root.colorByConnectionIds
  ) as any;

  const others = useOthers();
  const self = useSelf();

  useEffect(() => {
    const color = storageColorByConnectionIds[selectedBy];

    const found = [...others, self].find(
      (user) => user.connectionId === selectedBy
    );

    if (found) {
      setName(found.presence.name as any);
      setColor(color);
    }
  }, [others, selectedBy, self, storageColorByConnectionIds]);

  return (
    <div
      style={{
        ...(name && color && { borderColor: color, borderWidth: 2 }),
      }}
      className="bg-transparent p-1 bg-clip-content min-w-[250px] min-h-[50px] w-full h-full transition-all flex items-center justify-center"
    >
      <NodeResizer
        minWidth={36}
        minHeight={36}
        handleClassName="bg-purple-400 w-1 h-1 rounded-full"
        lineClassName="hidden"
        isVisible={selected}
      />

      {name && color && (
        <p
          style={{
            backgroundColor: color,
          }}
          className="absolute -top-7 right-0 text-white px-2 rounded-md text-sm"
        >
          {name}
        </p>
      )}

      <input
        onChange={(e) => {
          return onChange({
            id,
            text: e.target.value,
          });
        }}
        value={text}
        className="outline-none bg-transparent text-black dark:text-white px-5 w-full h-full"
      />

      <Handle
        id="bottom"
        position={Position.Bottom}
        type="source"
        className="-bottom-5 w-3 h-3 bg-purple-400 dark:bg-purple-100"
      />
      <Handle
        id="top"
        position={Position.Top}
        type="source"
        className="-top-5 w-3 h-3 bg-purple-400 dark:bg-purple-100"
      />
      <Handle
        id="left"
        position={Position.Left}
        type="source"
        className="-left-5 w-3 h-3 bg-purple-400 dark:bg-purple-100"
      />
      <Handle
        id="right"
        position={Position.Right}
        type="source"
        className="-right-5 w-3 h-3 bg-purple-400 dark:bg-purple-100"
      />
    </div>
  );
}
