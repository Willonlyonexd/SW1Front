import * as go from 'gojs';

export function importDiagramFromXML(xmlContent, diagram) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "application/xml");

  // Log para ver si el XML fue correctamente leído
  console.log("XML leído correctamente:", xmlDoc);

  // Procesar nodos (clases)
  const classElements = xmlDoc.getElementsByTagName("UML:Class");
  const nodes = [];
  
  for (let i = 0; i < classElements.length; i++) {
    const classElement = classElements[i];
    const className = classElement.getAttribute("name");
    const classId = classElement.getAttribute("xmi.id");

    const attributes = Array.from(classElement.getElementsByTagName("UML:Attribute"))
      .map(attr => {
        const expression = attr.getElementsByTagName("UML:Expression")[0];
        return expression ? `${attr.getAttribute("name")}:${expression.getAttribute("body")}` : `${attr.getAttribute("name")}`;
      })
      .join("\n");

    // Busca la posición en el diagrama
    const diagramElement = xmlDoc.querySelector(`[subject="${classId}"]`);
    const geometry = diagramElement ? diagramElement.getAttribute("geometry") : null;
    const loc = geometry ? geometry.split(';')[0].split('=')[1] + ' ' + geometry.split(';')[1].split('=')[1] : "0 0";

    nodes.push({
      key: className,
      attributes: attributes,
      loc: loc
    });

    // Log para verificar que los nodos están siendo procesados correctamente
    console.log(`Nodo procesado: ${className}, con atributos: ${attributes}, loc: ${loc}`);
  }

  // Procesar enlaces (relaciones)
  const associations = xmlDoc.getElementsByTagName('UML:Association');
  const links = [];

  for (let i = 0; i < associations.length; i++) {
    const association = associations[i];
    const ends = association.getElementsByTagName("UML:AssociationEnd");
    
    if (ends.length >= 2) { // Asegúrate de que haya al menos 2 extremos de asociación
      const sourceId = ends[0].getAttribute("type");
      const targetId = ends[1].getAttribute("type");

      const sourceNode = nodes.find(node => `EAID_${node.key}` === sourceId);
      const targetNode = nodes.find(node => `EAID_${node.key}` === targetId);

      if (sourceNode && targetNode) {
        links.push({
          from: sourceNode.key,
          to: targetNode.key,
          category: association.getAttribute("xmi.id").includes("Aggregation") ? "Aggregation" : "Association"
        });

        // Log para verificar las relaciones
        console.log(`Relación procesada: ${sourceNode.key} --> ${targetNode.key}`);
      }
    } else {
      console.warn('Enlace inválido, menos de dos extremos encontrados en la asociación.');
    }
  }

  // Cargar los nodos y enlaces en el diagrama
  diagram.model = new go.GraphLinksModel(nodes, links);

  // Log final para ver la estructura completa
  console.log("Nodos cargados:", nodes);
  console.log("Enlaces cargados:", links);
}
