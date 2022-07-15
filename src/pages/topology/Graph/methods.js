import "@antv/x6-vue-shape";
import { Graph, Addon } from "@antv/x6";
import cloud from "@/assets/img/cloud1.png";
import core from "@/assets/img/core1.png";
import switch1 from "@/assets/img/switch1.png";
import server from "@/assets/img/server1.png";
import firewalld from "@/assets/img/firewalld1.png";

Graph.registerNode(
  "custom-image",
  {
    inherit: "rect",
    width: 60,
    height: 60,
    markup: [
      {
        tagName: "rect",
        selector: "body",
      },
      {
        tagName: "image",
      },
      {
        tagName: "text",
        selector: "label",
      },
    ],
    attrs: {
      body: {
        rx: 0,
        ry: 0,
        stroke: "rgba(95,149,255,0.00)",
        strokeWidth: 1,
        fill: "rgba(95,149,255,0.00)",
      },
      image: {
        width: 60,
        height: 60,
        refX: 0,
        refY: 0,
      },
      label: {
        refX: 0.5,
        refY: 80,
        textAnchor: "middle",
        textVerticalAnchor: "bottom",
        fontSize: 14,
        fill: "#000",
      },
    },
    ports: { ...ports },
  },
  true
);

export const startDragToGraph = (graph, type, e) => {
  const node =
    type === "cloud"
      ? graph.createNode({
          shape: "custom-image",
          label: "",
          attrs: {
            image: {
              "xlink:href": cloud,
            },
          },
          ports: ports,
        })
      : type === "core"
      ? graph.createNode({
          shape: "custom-image",
          label: "",
          attrs: {
            image: {
              "xlink:href": core,
            },
          },
          ports: ports,
        })
      : type === "switch"
      ? graph.createNode({
          shape: "custom-image",
          label: "",
          attrs: {
            image: {
              "xlink:href": switch1,
            },
          },
          ports: ports,
        })
      : type === "server"
      ? graph.createNode({
          shape: "custom-image",
          label: "",
          attrs: {
            image: {
              "xlink:href": server,
            },
          },
          ports: ports,
        })
      : type === "firewalld"
      ? graph.createNode({
          shape: "custom-image",
          label: "",
          attrs: {
            image: {
              "xlink:href": firewalld,
            },
          },
          ports: ports,
        })
      : "";
  const dnd = new Addon.Dnd({ target: graph });
  dnd.start(node, e);
};

const ports = {
  groups: {
    // 输入链接桩群组定义
    top: {
      position: "top",
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: "#2D8CF0",
          strokeWidth: 2,
          fill: "#fff",
        },
      },
    },
    // 输出链接桩群组定义
    bottom: {
      position: "bottom",
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: "#2D8CF0",
          strokeWidth: 2,
          fill: "#fff",
        },
      },
    },
    left: {
      position: "left",
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: "#2D8CF0",
          strokeWidth: 2,
          fill: "#fff",
        },
      },
    },
    right: {
      position: "right",
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: "#2D8CF0",
          strokeWidth: 2,
          fill: "#fff",
        },
      },
    },
  },
  items: [
    {
      id: "port1",
      group: "top",
    },
    {
      id: "port2",
      group: "bottom",
    },
    {
      id: "port3",
      group: "left",
    },
    {
      id: "port4",
      group: "right",
    },
  ],
};
