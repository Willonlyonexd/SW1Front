import { useRef, useImperativeHandle, forwardRef, useEffect, useState } from 'react';
import * as go from 'gojs';
import { exportDiagramToXMI } from './ExportGoJs'; // Importamos la nueva función de 
import { importDiagramFromXML } from './Importxml'; 
import socket from '../sockets/socket';  // Importa el socket
import PropTypes from 'prop-types';
const $ = go.GraphObject.make;

//Construccion de nodos con atributos y metodos
const Diagram = forwardRef((props, ref) => {
  const diagramRef = useRef(null);
  const diagramInstance = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedLink, setSelectedLink] = useState(null); // Estado para el enlace seleccionado
  const [attribute, setAttribute] = useState("");
  const [attributeType, setAttributeType] = useState("int");
  const [methodName, setMethodName] = useState(""); 
  const [methodType, setMethodType] = useState("void"); 
  const [nodeName, setNodeName] = useState(""); // Estado para el nombre del nodo
  const [message, setMessage] = useState(""); // Para almacenar el mensaje actual
  const [chatMessages, setChatMessages] = useState([]); 
  const [connectedUsers, setConnectedUsers] = useState([]);
  //const [] = useState(null);



const handleLeaveRoom = () => {
  socket.emit('leave_room', { roomCode: props.roomCode, username: 'TuNombreDeUsuario' });
  window.location.href = 'http://:5173/dashboard'; 
};
const enableGeneralLinking = () => {
  if (diagramInstance.current) {
    // Restablecer la herramienta de enlace y eliminar la recursividad
    const toolManager = diagramInstance.current.toolManager.linkingTool;
    toolManager.isEnabled = true; // Habilitar la herramienta de enlace
    toolManager.archetypeLinkData = {}; // Eliminar configuraciones anteriores
    toolManager.isValidLink = go.LinkingTool.prototype.isValidLink; // Restablecer la validación predeterminada

    console.log('Herramienta de enlace general habilitada.');
  }
};



  const handleAddEntity = () => {
    if (diagramInstance.current) {
      const model = diagramInstance.current.model;
      const newNodeData = {
        key: `Entidad ${model.nodeDataArray.length + 1}`,  // Asegúrate de que el ID sea único
        loc: "0 0", // Ajustar la posición inicial de la entidad
        attributes: "",
        methods: ""
      };
      // Emitir el evento al socket
      socket.emit('add_entity', { roomCode: props.roomCode, nodeData: newNodeData });
      model.addNodeData(newNodeData);

    }
};  
const handleDeleteSelection = () => {
  if (selectedNode) {
    const model = diagramInstance.current.model;

    // Emitir el evento para eliminar la entidad
    socket.emit('delete_entity', {
      roomCode: props.roomCode,
      nodeId: selectedNode.key,
      username: 'NombreDelUsuario', // Cambia por el nombre real
    });

    // Eliminar el nodo localmente
    model.removeNodeData(selectedNode);
    setSelectedNode(null); // Limpiar la selección

    // Eliminar todos los enlaces relacionados
    const linksToDelete = model.linkDataArray.filter(link => link.from === selectedNode.key || link.to === selectedNode.key);
    linksToDelete.forEach(link => model.removeLinkData(link));
  }
};

const handleDeleteLink = (link) => {
  if (link) {
    const model = diagramInstance.current.model;

    // Emitir el evento para eliminar el enlace
    socket.emit('delete_link', {
      roomCode: props.roomCode,
      linkId: link.key, // Suponiendo que tienes un key en tus enlaces
    });

    // Eliminar el enlace localmente
    model.removeLinkData(link);
    setSelectedLink(null); // Limpiar la selección del enlace
  }
};

const handleEditNodeName = () => {
  if (selectedNode) {
    const model = diagramInstance.current.model;
    socket.emit('rename_entity', { roomCode: props.roomCode, nodeId: selectedNode.key, newName: nodeName });
    model.setDataProperty(selectedNode, 'key', nodeName);
    setNodeName(""); // Limpiar el input después de editar
  }
};

const handleAddAttribute = () => {
  if (selectedNode) {
    const model = diagramInstance.current.model;
    const newAttribute = `${attribute}:${attributeType}`;
    
    // Si el nodo tiene atributos previos, los concatenamos con el nuevo
    const updatedAttributes = selectedNode.attributes
      ? selectedNode.attributes + `\n${newAttribute}`
      : newAttribute;

    // Emitir el evento al socket para que todos los usuarios puedan ver el nuevo atributo
    socket.emit('add_attribute', { roomCode: props.roomCode, nodeId: selectedNode.key, attribute: updatedAttributes, username: 'NombreDelUsuario' });

    // Guardar los atributos actualizados en el nodo localmente
    model.setDataProperty(selectedNode, 'attributes', updatedAttributes);
    
    // Limpiar el input después de agregar el atributo
    setAttribute("");
  }
};
const handleAddMethod = () => {
  if (selectedNode) {
    const model = diagramInstance.current.model;
    const newMethod = `${methodName}(): ${methodType}`;
    
    // Si el nodo tiene métodos previos, los concatenamos con el nuevo
    const updatedMethods = selectedNode.methods
      ? selectedNode.methods + `\n${newMethod}`
      : newMethod;

    // Emitir el evento al socket para que todos los usuarios puedan ver el nuevo método
    socket.emit('add_method', { roomCode: props.roomCode, nodeId: selectedNode.key, method: updatedMethods, username: 'NombreDelUsuario' }); // Cambia 'NombreDelUsuario' por el nombre real del usuario

    // Guardar los métodos actualizados en el nodo localmente
    model.setDataProperty(selectedNode, 'methods', updatedMethods);
    
    // Limpiar el input después de agregar el método
    setMethodName("");
  }
};


const sendMessage = () => {
  if (message.trim() !== "") {
    // Emitir el mensaje al servidor
    socket.emit('chat_message', { roomCode: props.roomCode, message });
    setMessage(""); // Limpiar el campo de texto después de enviar
  }
};

// Escuchar el evento de agregar entidad
useEffect(() => {
  socket.on('entity_added', (data) => {
    if (diagramInstance.current) {
      const model = diagramInstance.current.model;

      // Verificar si la entidad ya existe antes de añadir
      const existingNode = model.nodeDataArray.find(node => node.key === data.nodeData.key);
      if (!existingNode) {
        model.addNodeData(data.nodeData);
      }
    }
  });
  socket.on('entity_deleted', (data) => {
    if (diagramInstance.current) {
      const model = diagramInstance.current.model;

      // Eliminar el nodo con el ID proporcionado
      const existingNode = model.nodeDataArray.find(node => node.key === data.nodeId);
      if (existingNode) {
        model.removeNodeData(existingNode);
      }
    }
  });

  socket.on('link_deleted', (data) => {
    if (diagramInstance.current) {
      const model = diagramInstance.current.model;

      // Eliminar el enlace con el ID proporcionado
      const existingLink = model.linkDataArray.find(link => link.key === data.linkId);
      if (existingLink) {
        model.removeLinkData(existingLink);
      }
    }
  });


  socket.on('attribute_added', (data) => {
    if (diagramInstance.current) {
      const model = diagramInstance.current.model;
      const nodeToUpdate = model.nodeDataArray.find(node => node.key === data.nodeId);
      if (nodeToUpdate) {
        // Actualizar los atributos del nodo
        model.setDataProperty(nodeToUpdate, 'attributes', data.attribute);
      }
    }
  });
  socket.on('method_added', (data) => {
    if (diagramInstance.current) {
      const model = diagramInstance.current.model;
      const nodeToUpdate = model.nodeDataArray.find(node => node.key === data.nodeId);
      if (nodeToUpdate) {
        // Actualizar los métodos del nodo
        model.setDataProperty(nodeToUpdate, 'methods', data.method);
      }
    }
  });
  socket.on('entity_renamed', (data) => {
    if (diagramInstance.current) {
      const model = diagramInstance.current.model;
      const nodeToUpdate = model.nodeDataArray.find(node => node.key === data.nodeId);
      if (nodeToUpdate) {
        model.setDataProperty(nodeToUpdate, 'key', data.newName);
      }
    }
  });
  socket.on('association_added', (data) => {
    if (diagramInstance.current) {
      const model = diagramInstance.current.model;

      // Comprobar si ya existe la relación entre los nodos
      const existingLink = model.linkDataArray.find(link =>
        link.from === data.fromNode && link.to === data.toNode
      );

      if (!existingLink) {
        // Si no existe, agregamos el enlace
        model.addLinkData({
          from: data.fromNode,
          to: data.toNode,
          category: data.category,
          fromText: data.fromText,
          toText: data.toText
        });
      }
    }
  });
  socket.on('association_direct_added', (data) => {
    if (diagramInstance.current) {
      const model = diagramInstance.current.model;

      // Comprobar si ya existe la relación directa entre los nodos
      const existingLink = model.linkDataArray.find(link =>
        link.from === data.fromNode && link.to === data.toNode
      );

      if (!existingLink) {
        // Si no existe, agregamos el enlace directo
        model.addLinkData({
          from: data.fromNode,
          to: data.toNode,
          category: data.category,
          fromText: data.fromText,
          toText: data.toText
        });
      }
    }
  });
  socket.on('composition_added', (data) => {
    if (diagramInstance.current) {
      const model = diagramInstance.current.model;

      // Comprobar si ya existe la relación de composición entre los nodos
      const existingLink = model.linkDataArray.find(link =>
        link.from === data.fromNode && link.to === data.toNode
      );

      if (!existingLink) {
        // Si no existe, agregamos el enlace de composición
        model.addLinkData({
          from: data.fromNode,
          to: data.toNode,
          category: data.category,
          fromText: data.fromText,
          toText: data.toText,
          toArrow: "Diamond", // Indicador visual de composición
        });
      }
    }
  });
  socket.on('aggregation_added', (data) => {
    if (diagramInstance.current) {
      const model = diagramInstance.current.model;

      // Comprobar si ya existe la relación de agregación entre los nodos
      const existingLink = model.linkDataArray.find(link =>
        link.from === data.fromNode && link.to === data.toNode
      );

      if (!existingLink) {
        // Si no existe, agregamos el enlace de agregación
        model.addLinkData({
          from: data.fromNode,
          to: data.toNode,
          category: data.category,
          fromText: data.fromText,
          toText: data.toText,
          toArrow: "Diamond", // Indicador visual de agregación (diamante vacío)
        });
      }
    }
  });
  socket.on('generalization_added', (data) => {
    if (diagramInstance.current) {
      const model = diagramInstance.current.model;

      // Comprobar si ya existe la relación de generalización entre los nodos
      const existingLink = model.linkDataArray.find(link =>
        link.from === data.fromNode && link.to === data.toNode
      );

      if (!existingLink) {
        // Si no existe, agregamos el enlace de generalización
        model.addLinkData({
          from: data.fromNode,
          to: data.toNode,
          category: data.category,
          fromText: data.fromText,
          toText: data.toText,
          toArrow: "OpenTriangle", // Indicador visual de generalización
        });
      }
    }
  });
  socket.on('recursion_added', (data) => {
    if (diagramInstance.current) {
      const model = diagramInstance.current.model;

      // Comprobar si ya existe la relación de recursividad en el nodo
      const existingLink = model.linkDataArray.find(link =>
        link.from === data.nodeId && link.to === data.nodeId
      );

      if (!existingLink) {
        // Si no existe, agregamos el enlace de recursividad
        model.addLinkData({
          from: data.nodeId,
          to: data.nodeId,
          category: data.category,
          fromText: data.fromText,
          toText: data.toText,
          toArrow: "Standard", // Flecha estándar para mostrar la recursividad
        });
      }
    }
  });
  /*socket.on('many_to_many_added', (data) => {
    if (diagramInstance.current) {
      const model = diagramInstance.current.model;
      
      // Verificar si ya existe el enlace o la entidad intermedia
      const existingIntermediateNode = model.nodeDataArray.find(node => node.key === data.intermediateNodeId);
      
      if (!existingIntermediateNode) {
        // Agregar la entidad intermedia si no existe
        model.addNodeData({
          key: data.intermediateNodeId,
          attributes: "",
          methods: "",
          isIntermediate: true,
          loc: "0 0", // Posición provisional
        });
  
        // Conectar las entidades originales con la intermedia
        model.addLinkData({
          from: data.fromNodeId,
          to: data.intermediateNodeId,
          category: "Association",
          fromText: data.fromText,
          toText: data.toText,
        });
        model.addLinkData({
          from: data.toNodeId,
          to: data.intermediateNodeId,
          category: "Association",
          fromText: data.fromText,
          toText: data.toText,
        });
      }  
    }
  });
  */
  socket.on('dependency_added', (data) => {
    if (diagramInstance.current) {
      const model = diagramInstance.current.model;

      // Verificar si ya existe el enlace
      const existingLink = model.linkDataArray.find(link =>
        link.from === data.fromNodeId && link.to === data.toNodeId && link.category === "Dependency"
      );

      if (!existingLink) {
        // Agregar el enlace de dependencia si no existe
        model.addLinkData({
          from: data.fromNodeId,
          to: data.toNodeId,
          category: "Dependency",
          fromText: data.fromText,
          toText: data.toText,
        });
      }
    }
  });
  socket.on('node_position_updated', (data) => {
    if (diagramInstance.current) {
      const model = diagramInstance.current.model;

      // Encontrar el nodo que necesita ser actualizado
      const nodeToUpdate = model.nodeDataArray.find(node => node.key === data.nodeId);

      if (nodeToUpdate) {
        // Actualizar la posición del nodo
        model.setDataProperty(nodeToUpdate, 'loc', data.newPosition);
      }
    }
  });
  socket.on('link_text_updated', (data) => {
    const { fromNode, toNode, fromText, toText } = data;
    const model = diagramInstance.current.model;

    // Buscar el enlace correspondiente en el modelo y actualizar los textos
    const linkToUpdate = model.linkDataArray.find(
      link => link.from === fromNode && link.to === toNode
    );

    if (linkToUpdate) {
      model.setDataProperty(linkToUpdate, 'fromText', fromText);
      model.setDataProperty(linkToUpdate, 'toText', toText);
    }
  });

  socket.on('association_direct_text_updated', (data) => {
    const { fromNode, toNode, fromText, toText } = data;
    const model = diagramInstance.current.model;

    // Buscar el enlace correspondiente en el modelo y actualizar los textos
    const linkToUpdate = model.linkDataArray.find(
      link => link.from === fromNode && link.to === toNode && link.category === "AssociationDirect"
    );

    if (linkToUpdate) {
      model.setDataProperty(linkToUpdate, 'fromText', fromText);
      model.setDataProperty(linkToUpdate, 'toText', toText);
    }
  });


 
  socket.on('chat_message_broadcast', (data) => {
    setChatMessages((prevMessages) => [...prevMessages, data]);
  });
  socket.on('users_in_room', (users) => {
    setConnectedUsers(users);
  });
  socket.emit('join_room', { roomCode: props.roomCode, username: 'TuNombreDeUsuario' });

  return () => {
    socket.off('entity_added');
    socket.off('entity_deleted');
    socket.off('link_deleted');
    socket.off('attribute_added');
    socket.off('method_added'); 
    socket.off('entity_renamed');
    socket.off('association_added');
    socket.off('association_direct_added');
    socket.off('composition_added');
    socket.off('aggregation_added');
    socket.off('generalization_added');
    socket.off('recursion_added');
    //socket.off('many_to_many_added');
    socket.off('dependency_added');
    socket.off('node_position_updated');
    socket.off('chat_message_broadcast');
    socket.off('chat_message_broadcast');
    socket.off('users_in_room');
    socket.off('update_link_text');
    socket.off('association_direct_text_updated');


  };
}, [props.roomCode]);


const handleExportToXML = () => {
  if (diagramInstance.current) {
    exportDiagramToXMI(diagramInstance.current);
  }
};
const handleImportXML = (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    const xmlContent = e.target.result;
    if (diagramInstance.current) {
      importDiagramFromXML(xmlContent, diagramInstance.current);
    }
  };
  reader.readAsText(file);
};

  // Posiciones a usar para sockets y guardar es posiciones ..
let nextPosX = 0;
let nextPosY = 0;
const stepSize = 150; // Espacio entre los nodos
function getNextPosition() {
  const pos = `${nextPosX} ${nextPosY}`;
  nextPosX += stepSize;
  if (nextPosX > 500) { // Cambiar esta condición para un límite de la cuadrícula
    nextPosX = 0;
    nextPosY += stepSize;
  }
  return pos;
}
   //creador de entidades
  useImperativeHandle(ref, () => ({
    addEntity() {
      if (diagramInstance.current) {
        const model = diagramInstance.current.model;
        const newNodeData = { key: `Entidad ${model.nodeDataArray.length + 1}`, loc:getNextPosition(), attributes: "", methods: ""  };
        model.addNodeData(newNodeData);
      }
    },
    deleteSelection() {
      if (diagramInstance.current) {
        diagramInstance.current.commandHandler.deleteSelection();
      }
    },
    exportToXML() {
      if (diagramInstance.current) {
        exportDiagramToXMI(diagramInstance.current);
      }
  },
  
  }));

  useEffect(() => {

    if (!diagramInstance.current && diagramRef.current) {
      // Inicializar el diagrama
      diagramInstance.current = $(go.Diagram, diagramRef.current, {
        'undoManager.isEnabled': true,
        initialContentAlignment: go.Spot.Center,
      });
 
      diagramInstance.current.nodeTemplate = $(
        go.Node, 'Spot',
  new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
  $(go.Panel, 'Auto',
    $(go.Shape, 'RoundedRectangle', { fill: "cyan", strokeWidth: 2 }),  // Cambia el color aqu
    $(go.Panel, 'Vertical',
      $(go.TextBlock, { 
        margin: 4, // Ajusta el margen del nombre
        font: "bold 12px sans-serif", 
        editable: true 
      }, new go.Binding('text', 'key').makeTwoWay()),
    
      $(go.TextBlock, {
        editable: true, 
        margin: 2, // Ajusta el margen de los atributos
        font: "11px sans-serif"
      }, new go.Binding('text', 'attributes')),
    
      $(go.TextBlock, {
        editable: true, 
        margin: 2, // Ajusta el margen de los métodos
        font: "11px sans-serif"
      }, new go.Binding('text', 'methods'))
    )
        ),
        makePort("T", go.Spot.Top, true, true),
        makePort("L", go.Spot.Left, true, true),
        makePort("R", go.Spot.Right, true, true),
        makePort("B", go.Spot.Bottom, true, true),
        makePort("TL", go.Spot.TopLeft, true, true),
        makePort("TR", go.Spot.TopRight, true, true),
        makePort("BL", go.Spot.BottomLeft, true, true),
        makePort("BR", go.Spot.BottomRight, true, true)
      );

      // Listener para seleccionar enlaces
diagramInstance.current.addDiagramListener('ObjectSingleClicked', (e) => {
  const part = e.subject.part;
  
  if (part instanceof go.Link) {
    // Si es un enlace, guarda los datos del enlace
    setSelectedLink(part.data); // Asegúrate de tener un estado para esto
  } else if (part instanceof go.Node) {
    // Si es un nodo, guarda los datos del nodo
    setSelectedNode(part.data);
  }
});


diagramInstance.current.linkTemplateMap.add("Association", 
  $(go.Link, {
      routing: go.Link.Normal,
      curve: go.Link.None,
      reshapable: true, resegmentable: true,
      fromSpot: go.Spot.AllSides, toSpot: go.Spot.AllSides
    },
    $(go.Shape),  // Línea básica
    $(go.Shape, { toArrow: "" }), // Sin flecha por defecto
    $(go.TextBlock, "1..1", { 
      segmentIndex: 0, 
      segmentOffset: new go.Point(NaN, NaN), 
      editable: true,  // Permitir la edición del texto
    }, 
    new go.Binding("text", "fromText").makeTwoWay()), // Enlazamos con el texto de origen
    $(go.TextBlock, "1..1", { 
      segmentIndex: -1, 
      segmentOffset: new go.Point(NaN, NaN), 
      editable: true,  // Permitir la edición del texto
    }, 
    new go.Binding("text", "toText").makeTwoWay()) // Enlazamos con el texto de destino
  )
);

       // Asociación
       diagramInstance.current.linkTemplateMap.add("AssociationDirect", 
        $(go.Link, {
          routing: go.Link.Normal,
          curve: go.Link.None,
          reshapable: true, resegmentable: true,
          fromSpot: go.Spot.AllSides, toSpot: go.Spot.AllSides
        },
        $(go.Shape),  // Línea básica
        $(go.Shape, { toArrow: "Standard" }), // Sin flecha por defecto
        $(go.TextBlock, "1..1", { 
          segmentIndex: 0, 
          segmentOffset: new go.Point(NaN, NaN), 
          editable: true,  // Permitir la edición del texto
        }, 
        new go.Binding("text", "fromText").makeTwoWay()), // Enlazamos con el texto de origen
        $(go.TextBlock, "1..1", { 
          segmentIndex: -1, 
          segmentOffset: new go.Point(NaN, NaN), 
          editable: true,  // Permitir la edición del texto
        }, 
        new go.Binding("text", "toText").makeTwoWay()) // Enlazamos con el texto de destino
      )
      );

      // Agregación
      diagramInstance.current.linkTemplateMap.add("Aggregation", 
        $(go.Link, {
            routing: go.Link.Normal,
            curve: go.Link.None,
            reshapable: true, resegmentable: true,
            fromSpot: go.Spot.AllSides, toSpot: go.Spot.AllSides
          },
          $(go.Shape),
          $(go.Shape, { toArrow: "Diamond", fill: "white" })
        )
      );

      // Generalización
      diagramInstance.current.linkTemplateMap.add("Generalization", 
        $(go.Link, {
            routing: go.Link.Normal,
            curve: go.Link.None,
            reshapable: true, resegmentable: true,
            fromSpot: go.Spot.AllSides, toSpot: go.Spot.AllSides
          },
          $(go.Shape),
          $(go.Shape, { toArrow: "Triangle", fill: "white" })
        )
      );

      // Recursividad
      diagramInstance.current.linkTemplateMap.add("Recursion",
        $(go.Link, {
            routing: go.Link.AvoidsNodes, // Para un enrutamiento mejorado
            curve: go.Link.JumpOver, // Curva la línea de enlace
            reshapable: true, resegmentable: true,
            fromSpot: go.Spot.Right, toSpot: go.Spot.Left, // Personaliza la posición de los puntos de enlace
            selectable: false // Previene seleccionar el enlace para entidades diferentes
          },
          $(go.Shape), // Línea básica
          $(go.Shape, { toArrow: "Standard" }), // Flecha estándar
          $(go.TextBlock, "", { segmentIndex: 0, segmentOffset: new go.Point(NaN, NaN), editable: true },
            new go.Binding("text", "fromText").makeTwoWay()),
          $(go.TextBlock, "", { segmentIndex: -1, segmentOffset: new go.Point(NaN, NaN), editable: true },
            new go.Binding("text", "toText").makeTwoWay())
        )
      );
      
    // DEPENDENCIA
// Dependencia (línea punteada con flecha)
diagramInstance.current.linkTemplateMap.add("Dependency", 
  $(go.Link, {
      routing: go.Link.Normal,
      curve: go.Link.None,
      reshapable: true, resegmentable: true,
      fromSpot: go.Spot.AllSides, toSpot: go.Spot.AllSides
    },
    $(go.Shape, { strokeDashArray: [4, 2] }), // Línea punteada
    $(go.Shape, { toArrow: "OpenTriangle" }) // Flecha abierta en el extremo destino
  )
);
      // Configuración del modelo vacío
      diagramInstance.current.model = new go.GraphLinksModel([], []);

      // Evento de clic en el nodo
      diagramInstance.current.addDiagramListener('ObjectSingleClicked', (e) => {
        const node = e.subject.part;
        if (node instanceof go.Node) {
          setSelectedNode(node.data);
        }
      });
    }

    // Relación Muchos a Muchos (ManyToMany)
diagramInstance.current.linkTemplateMap.add("ManyToMany", 
  $(go.Link, {
      routing: go.Link.AvoidsNodes, // Puedes ajustar el routing si lo necesitas
      curve: go.Link.None, 
      reshapable: true, 
      resegmentable: true,
      fromSpot: go.Spot.AllSides, toSpot: go.Spot.AllSides // Para permitir múltiples conexiones desde cualquier lado
    },
    $(go.Shape), // Línea básica
    $(go.Shape, { toArrow: "" }), // Puedes definir flechas según lo desees (en este caso, sin flecha)
    $(go.TextBlock, "1..n", { segmentIndex: 0, segmentOffset: new go.Point(NaN, NaN), editable: true }, 
      new go.Binding("text", "fromText").makeTwoWay()), // Textos de multiplicidad desde el nodo de origen
    $(go.TextBlock, "1..n", { segmentIndex: -1, segmentOffset: new go.Point(NaN, NaN), editable: true }, 
      new go.Binding("text", "toText").makeTwoWay()) // Textos de multiplicidad hacia el nodo de destino
  )
);


    diagramInstance.current.addDiagramListener('SelectionMoved', (e) => {
      const selectedNode = e.diagram.selection.first(); // Obtener el primer nodo seleccionado
  
      if (selectedNode instanceof go.Node) {
        const newPosition = go.Point.stringify(selectedNode.position); // Obtener la nueva posición del nodo
  
        // Emitir la actualización de posición al servidor
        socket.emit('update_node_position', {
          roomCode: props.roomCode,
          nodeId: selectedNode.data.key,
          newPosition: newPosition,
        });
      }
    });

    return () => {
      if (diagramInstance.current) {
        diagramInstance.current.div = null;
        diagramInstance.current = null;
      }
    };
  }, [props.roomCode]);

  // Función de relaciones

  
  const handleEnableAssociation = () => {
    // Configuramos el linkingTool para la asociación
    diagramInstance.current.toolManager.linkingTool.archetypeLinkData = {
      category: "Association",
      fromText: "1..1",
      toText: "1..1",
    };
    diagramInstance.current.toolManager.linkingTool.isEnabled = true;
  
    // Escuchar cuando se dibuja un enlace (relación)
    diagramInstance.current.addDiagramListener("LinkDrawn", (e) => {
      const link = e.subject;
  
      // Emitir la relación a través del socket cuando se crea
      socket.emit('add_association', {
        roomCode: props.roomCode,
        fromNode: link.fromNode.data.key,
        toNode: link.toNode.data.key,
        category: link.data.category,
        fromText: link.data.fromText || "1..1",
        toText: link.data.toText || "1..1",
      });
    });
  
    // Escuchar los cambios en los textos (fromText y toText)
    diagramInstance.current.addDiagramListener("TextEdited", (e) => {
      const textBlock = e.subject; // El bloque de texto que fue editado
      const link = textBlock.part; // El enlace asociado
  
      if (link instanceof go.Link) {
        // Emitir los cambios en los textos a través del socket
        socket.emit('update_link_text', {
          roomCode: props.roomCode,
          fromNode: link.fromNode.data.key,
          toNode: link.toNode.data.key,
          fromText: link.data.fromText,
          toText: link.data.toText,
        });
      }
    });
  };
  

  const handleEnableAssociationDirect = () => {
    // Configuramos el linkingTool para la asociación
    diagramInstance.current.toolManager.linkingTool.archetypeLinkData = {
      category: "AssociationDirect",
      fromText: "1..1",
      toText: "1..1",
    };
    diagramInstance.current.toolManager.linkingTool.isEnabled = true;
  
    // Escuchar cuando se dibuja un enlace (relación)
    diagramInstance.current.addDiagramListener("LinkDrawn", (e) => {
      const link = e.subject;
  
      // Emitir la relación a través del socket cuando se crea
      socket.emit('add_association', {
        roomCode: props.roomCode,
        fromNode: link.fromNode.data.key,
        toNode: link.toNode.data.key,
        category: link.data.category,
        fromText: link.data.fromText || "1..1",
        toText: link.data.toText || "1..1",
      });
    });
  
    // Escuchar los cambios en los textos (fromText y toText)
    diagramInstance.current.addDiagramListener("TextEdited", (e) => {
      const textBlock = e.subject; // El bloque de texto que fue editado
      const link = textBlock.part; // El enlace asociado
  
      if (link instanceof go.Link) {
        // Emitir los cambios en los textos a través del socket
        socket.emit('update_link_text', {
          roomCode: props.roomCode,
          fromNode: link.fromNode.data.key,
          toNode: link.toNode.data.key,
          fromText: link.data.fromText,
          toText: link.data.toText,
        });
      }
    });
  };
    

    const handleEnableComposition = () => {
      // Configuramos el linkingTool para la composición
      diagramInstance.current.toolManager.linkingTool.archetypeLinkData = {
        category: "Composition",
        fromText: "1..1",
        toText: "1..1",
        fromArrow: "", // Sin flecha al inicio
        toArrow: "Diamond", // Flecha en forma de diamante en el destino (composición)
      };
      diagramInstance.current.toolManager.linkingTool.isEnabled = true;
    
      // Escuchar el evento cuando se dibuja un enlace (relación de composición)
      diagramInstance.current.addDiagramListener("LinkDrawn", (e) => {
        const link = e.subject;
    
        // Emitir la relación de composición a través del socket
        socket.emit('add_composition', {
          roomCode: props.roomCode,
          fromNode: link.fromNode.data.key,
          toNode: link.toNode.data.key,
          category: link.data.category,
          fromText: link.data.fromText || "1..1",
          toText: link.data.toText || "1..1",
        });
      });
    };

    const handleEnableAggregation = () => {
      // Configuramos el linkingTool para la agregación
      diagramInstance.current.toolManager.linkingTool.archetypeLinkData = {
        category: "Aggregation",
        fromText: "1..1",
        toText: "1..n",
        fromArrow: "", // Sin flecha al inicio
        toArrow: "Diamond", // Flecha en forma de diamante vacío en el destino (agregación)
      };
      diagramInstance.current.toolManager.linkingTool.isEnabled = true;
    
      // Escuchar el evento cuando se dibuja un enlace (relación de agregación)
      diagramInstance.current.addDiagramListener("LinkDrawn", (e) => {
        const link = e.subject;
    
        // Emitir la relación de agregación a través del socket
        socket.emit('add_aggregation', {
          roomCode: props.roomCode,
          fromNode: link.fromNode.data.key,
          toNode: link.toNode.data.key,
          category: link.data.category,
          fromText: link.data.fromText || "1..1",
          toText: link.data.toText || "1..n",
        });
      });
    };

  const handleEnableGeneralization = () => {
  diagramInstance.current.toolManager.linkingTool.archetypeLinkData = {
    category: "Generalization",
    fromText: "1..1",
    toText: "1..1",
    fromArrow: "", // Sin flecha al inicio
    toArrow: "OpenTriangle", // Flecha en forma de triángulo vacío en el destino (generalización)
  };
  diagramInstance.current.toolManager.linkingTool.isEnabled = true;

  // Escuchar el evento cuando se dibuja un enlace (relación de generalización)
  diagramInstance.current.addDiagramListener("LinkDrawn", (e) => {
    const link = e.subject;

    // Emitir la relación de generalización a través del socket
    socket.emit('add_generalization', {
      roomCode: props.roomCode,
      fromNode: link.fromNode.data.key,
      toNode: link.toNode.data.key,
      category: link.data.category,
      fromText: link.data.fromText || "1..1",
      toText: link.data.toText || "1..1",
    });
  });
};


const handleEnableRecursion = () => {
  // Restablecer la herramienta de enlace antes de habilitar un nuevo modo
  diagramInstance.current.toolManager.linkingTool.isEnabled = false;
  diagramInstance.current.toolManager.linkingTool.isValidLink = null; // Restablecer el valor predeterminado

  // Configurar el linkingTool para recursividad
  diagramInstance.current.toolManager.linkingTool.archetypeLinkData = {
    category: "Recursion",
    fromText: "1..1",
    toText: "1..1",
  };

  // Validar solo enlaces recursivos (de la misma entidad a sí misma)
  diagramInstance.current.toolManager.linkingTool.isValidLink = function (fromNode, fromPort, toNode) {
    return fromNode === toNode; // Solo permitir enlaces recursivos
  };

  diagramInstance.current.toolManager.linkingTool.isEnabled = true;

  // Escuchar el evento cuando se dibuja un enlace (relación de recursión)
  diagramInstance.current.addDiagramListener("LinkDrawn", (e) => {
    const link = e.subject;
    
    // Iniciar una transacción para asegurar que el enlace recursivo se cree correctamente
    diagramInstance.current.model.startTransaction("Agregar recursividad");

    // Emitir la relación de recursividad a través del socket
    socket.emit('add_recursion', {
      roomCode: props.roomCode,
      nodeId: link.fromNode.data.key,  // La entidad es la misma para ambos lados
      category: link.data.category,
      fromText: link.data.fromText || "1..1",
      toText: link.data.toText || "1..1",
    });

    // Terminar la transacción después de agregar el enlace recursivo
    diagramInstance.current.model.commitTransaction("Agregar recursividad");

    // **Desactivar la herramienta de enlace al completar** para no seguir aplicando la recursividad
    diagramInstance.current.toolManager.linkingTool.isEnabled = false;
    diagramInstance.current.toolManager.linkingTool.archetypeLinkData = null;
    diagramInstance.current.toolManager.linkingTool.isValidLink = null;
  });

  console.log("Recursividad habilitada");
};

// Socket listener para cuando se recibe la relación de recursividad
socket.on('recursion_added', (data) => {
  if (diagramInstance.current) {
    const model = diagramInstance.current.model;

    // Comprobar si ya existe la relación de recursividad en el nodo
    const existingLink = model.linkDataArray.find(link =>
      link.from === data.nodeId && link.to === data.nodeId && link.category === "Recursion"
    );

    if (!existingLink) {
      // Iniciar una transacción para agregar el enlace recursivo
      model.startTransaction("Agregar recursividad por socket");

      // Agregar el enlace de recursividad si no existe
      model.addLinkData({
        from: data.nodeId,
        to: data.nodeId,
        category: "Recursion",
        fromText: data.fromText,
        toText: data.toText,
        toArrow: "Standard", // Flecha estándar para mostrar la recursividad
      });

      // Terminar la transacción
      model.commitTransaction("Agregar recursividad por socket");
    }
  }
});



const handleEnableManyToMany = () => {
  // Configurar la herramienta de enlace para ManyToMany
  diagramInstance.current.toolManager.linkingTool.isValidLink = () => true;

  // Configurar los datos del enlace como "ManyToMany"
  diagramInstance.current.toolManager.linkingTool.archetypeLinkData = {
    category: "ManyToMany",
  };

  // Habilitar la herramienta de enlace
  diagramInstance.current.toolManager.linkingTool.isEnabled = true;

  // Añadir listener para cuando se dibuja un enlace
  diagramInstance.current.addDiagramListener("LinkDrawn", (e) => {
    const link = e.subject;
    const model = diagramInstance.current.model;
    const fromNode = link.fromNode.data.key;
    const toNode = link.toNode.data.key;

    // Generar un nombre único para la tabla intermedia
    const intermediateEntityName = `${fromNode}_${toNode}_Association`;

    // Verificar si la entidad intermedia ya existe
    const existingIntermediateNode = model.nodeDataArray.find(
      (node) => node.key === intermediateEntityName
    );

    // Si ya existe la tabla intermedia, no hacemos nada más
    if (existingIntermediateNode) {
      console.log("La tabla intermedia ya existe");
      return;
    }

    // **Eliminar el enlace directo entre las dos entidades originales**
    model.removeLinkData(link.data);

    // Calcular la ubicación de la nueva entidad intermedia (en el punto medio)
    const fromNodeLocation = go.Point.parse(link.fromNode.location.toString());
    const toNodeLocation = go.Point.parse(link.toNode.location.toString());

    const intermediateLocation = new go.Point(
      (fromNodeLocation.x + toNodeLocation.x) / 2,
      (fromNodeLocation.y + toNodeLocation.y) / 2
    ).toString();

    // Crear una nueva entidad intermedia
    const newIntermediateNode = {
      key: intermediateEntityName,
      attributes: "id: int\nname: varchar", // Atributos por defecto para la entidad
      methods: "", // Métodos vacíos
      isIntermediate: true,
      loc: intermediateLocation, // Posición en el medio de los dos nodos
    };

    // Añadir la entidad intermedia al modelo
    model.addNodeData(newIntermediateNode);

    // **Crear los enlaces desde las entidades originales a la entidad intermedia**
    model.addLinkData({
      from: fromNode,
      to: intermediateEntityName,
      category: "Association",
      fromText: "1..n",
      toText: "1..n",
    });

    model.addLinkData({
      from: toNode,
      to: intermediateEntityName,
      category: "Association",
      fromText: "1..n",
      toText: "1..n",
    });

    console.log("Tabla intermedia creada con éxito");

    // Desactivar la herramienta de enlace para evitar que continúe activa
    diagramInstance.current.toolManager.linkingTool.isEnabled = false;
    diagramInstance.current.toolManager.linkingTool.archetypeLinkData = null;
  });
};


const handleEnableDependency = () => {
  // Configurar el linkingTool para la categoría de Dependencia
  diagramInstance.current.toolManager.linkingTool.archetypeLinkData = {
    category: "Dependency",
    fromText: "",
    toText: "",
  };
  diagramInstance.current.toolManager.linkingTool.isEnabled = true;

  // Escuchar cuando se dibuja un enlace de dependencia
  diagramInstance.current.addDiagramListener("LinkDrawn", (e) => {
    const link = e.subject;

    // Emitir el evento al servidor a través de WebSocket
    socket.emit('add_dependency', {
      roomCode: props.roomCode,
      fromNode: link.fromNode.data.key,
      toNode: link.toNode.data.key,
      category: link.data.category,
      fromText: link.data.fromText || "1..1",
      toText: link.data.toText || "1..1",
    });
  });
};

  // Creación de puertos
  function makePort(name, spot, output, input) {
    return $(go.Shape, "Circle",
      {
        fill: "transparent", stroke: null, desiredSize: new go.Size(8, 8),
        alignment: spot, alignmentFocus: spot, portId: name,
        fromSpot: spot, toSpot: spot,
        fromLinkable: output, toLinkable: input, cursor: "pointer",
        fromMaxLinks: 1, toMaxLinks: 1
      });
  }

  return (
    <div className="flex">
       {/* Panel de control */}
       <aside className="w-1/4 bg-gray-800 text-white p-4">
      <h2 className="text-xl font-bold mb-4">Panel de Control</h2>
      <div className="flex flex-col space-y-2">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          onClick={handleAddEntity}
        >
          Añadir Entidad
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          onClick={handleDeleteSelection}
        >
          Eliminar Selección
        </button>
        <button
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
          onClick={handleExportToXML}
        >
          Exportar a XML
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          onClick={() => handleDeleteLink(selectedLink)} // Asegúrate de que selectedLink tenga el enlace seleccionado
        >
          Eliminar Enlace
        </button>
        <input
          type="file"
          accept=".xml"
          className="bg-green-500 text-white font-bold py-2 px-4 rounded"
          onChange={handleImportXML}
        />
      </div>
      
      <button
        className="bg-red-500 hover:bg-red-600 text-white font-bold py- px-4 rounded"
        onClick={handleLeaveRoom}
      >
        Salir de la Sala
      </button>



      {/* Mostrar los usuarios conectados */}
      <div className="mt-4 p-2 bg-gray-900 rounded" style={{ maxHeight: '150px', overflowY: 'auto' }}>
          <h3 className="text-lg mb-2">Usuarios Conectados</h3>
          <ul>
            {connectedUsers.map((user, index) => (
              <li key={index} className="text-white">{user.username}</li>
            ))}
          </ul>
        </div>
       {/* Área del chat */}
       <div className="mt-4 p-2 bg-gray-900 rounded" style={{ height: '200px', overflowY: 'scroll' }}>
        <h3 className="text-lg mb-2">Chat</h3>
        <div className="chat-messages">
          {chatMessages.map((msg, index) => (
            <div key={index} className="mb-1">
              <span>{msg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Input para enviar mensajes */}
      <div className="mt-2">
        <input 
          type="text" 
          value={message}
          onChange={(e) => setMessage(e.target.value)} 
          className="border p-1 w-full mb-2  text-black" 
          placeholder="Escribe un mensaje..." 
        />
        <button onClick={sendMessage} className="bg-blue-500 text-black px-4 py-2 w-full">Enviar</button>
      </div>
    </aside>

    {/* Área de diagramación */}
    <div ref={diagramRef} className="flex-grow" style={{ height: '100vh', overflow: 'auto' }} />

    {/* Panel de atributos y métodos */}
    {selectedNode && (
      <div
        style={{ width: '25%', padding: '25px', borderLeft: '1px solid black', overflowY: 'auto', height: '100vh' }}
      > <h3>Nombre de la clase</h3>
      <input type="text" value={nodeName} onChange={(e) => setNodeName(e.target.value)} className="border p-0 mb-2 w-full" />
      <button onClick={handleEditNodeName} className="bg-green-500 text-white p-0 mt-0 w-full">Guardar Nombre</button>
        <h3>Agregar Atributo</h3>
        <div>
          <input
            type="text"
            placeholder="Nombre del Atributo"
            value={attribute}
            onChange={(e) => setAttribute(e.target.value)}
            className="border p-1 mb-0 w-full"
          />
          <label>
            Seleccione Tipo:
            <select
              value={attributeType}
              onChange={(e) => setAttributeType(e.target.value)}
              className="border p-1 mb-0 w-full"
            >
              <option value="int">int</option>
              <option value="char">char</option>
              <option value="float">float</option>
              {/* Agregar más tipos si es necesario */}
            </select>
          </label>
          <button
            onClick={handleAddAttribute}
            className="bg-blue-500 text-white p-0 mt-0 w-full"
          >
            Agregar
          </button>

          <hr className="my-4" />

          {/* Controles para agregar métodos */}
          <h3>Agregar Método</h3>
          <div>
            <input
              type="text"
              placeholder="Nombre del Método"
              value={methodName}
              onChange={(e) => setMethodName(e.target.value)}
              className="border p-1 mb-0 w-full"
            />
            <label>
              Seleccione Tipo Retorno:
              <select
                value={methodType}
                onChange={(e) => setMethodType(e.target.value)}
                className="border p-1 mb-2 w-full"
              >
                <option value="void">void</option>
                <option value="int">int</option>
                <option value="char">char</option>
                <option value="float">float</option>
                {/* Agregar más tipos si es necesario */}
              </select>
            </label>
            <button
              onClick={handleAddMethod}
              className="bg-blue-500 text-white p-0 mt-0 w-full"
            >
              Agregar Método
            </button>
          </div>
          <button onClick={enableGeneralLinking}>
  Restablecer Enlaces
</button>

          <hr className="my-4" />

          {/* Botones para las relaciones */}
          <button
            onClick={handleEnableAssociation}
            className="bg-green-500 text-white px-4 py-2 mt-0"
          >
            Asociación
          </button>
          <button
            onClick={handleEnableAssociationDirect}
            className="bg-cyan-500 text-white px-1 py-2 mt-1"
          >
            Asociación Directa
          </button>
          <button
            onClick={handleEnableComposition}
            className="bg-red-500 text-white px-4 py-2 mt-2"
          >
            Composición
          </button>
          <button
            onClick={handleEnableAggregation}
            className="bg-yellow-500 text-white px-4 py-2 mt-2"
          >
            Agregación
          </button>
          <button
            onClick={handleEnableGeneralization}
            className="bg-blue-500 text-white px-4 py-2 mt-2"
          >
            Generalización
          </button>
          <button
            onClick={handleEnableRecursion}
            className="bg-purple-500 text-white px-4 py-2 mt-2"
          >
            Recursividad
          </button>
          <button
            onClick={handleEnableDependency}
            className="bg-gray-500 text-white px-4 py-2 mt-2"
          >
            Dependencia
          </button>
          <button
            onClick={handleEnableManyToMany}
            className="bg-blue-500 text-white px-2 py-2 mt-2"
          >
            Asosiacion Class
          </button>
        </div>
      </div>
    )}
  </div>
    );
  
});

// Aquí se definen las PropTypes
Diagram.propTypes = {
  roomCode: PropTypes.string.isRequired,  // Validar que roomCode es una prop requerida
};

Diagram.displayName = "Diagram";

export default Diagram;
