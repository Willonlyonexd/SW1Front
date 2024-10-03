export function exportDiagramToXMI(diagram) {
  const nodes = diagram.model.nodeDataArray;
  const links = diagram.model.linkDataArray;

  let xmiContent = `<?xml version="1.0" encoding="windows-1252"?>\n`;

  // Añadir encabezado
  xmiContent += `
<XMI xmi.version="1.1" xmlns:UML="omg.org/UML1.3">
  <XMI.header>
    <XMI.documentation>
      <XMI.exporter>GoJS Diagram Exporter</XMI.exporter>
      <XMI.exporterVersion>1.0</XMI.exporterVersion>
    </XMI.documentation>
  </XMI.header>
  <XMI.content>
    <UML:Model name="GoJS Diagram" xmi.id="EA_Model">
      <UML:Namespace.ownedElement>\n`;

  // Añadir nodos (entidades)
  nodes.forEach((node) => {
    const loc = node.loc.split(" ");
    xmiContent += `
    <UML:Class name="${node.key}" xmi.id="EAID_${node.key.replace(/\s/g, '_')}" visibility="public">
        <UML:Classifier.feature>
            ${node.attributes.split("\n").map(attr => `
              <UML:Attribute name="${attr.split(":")[0]}" visibility="private" changeable="none">
                <UML:Attribute.initialValue>
                    <UML:Expression body="${attr.split(":")[1]}"/>
                </UML:Attribute.initialValue>
              </UML:Attribute>`).join('')}
        </UML:Classifier.feature>
    </UML:Class>\n`;

    // Añadir geometría del nodo
    xmiContent += `<UML:DiagramElement geometry="Left=${loc[0]};Top=${loc[1]};Right=${parseInt(loc[0]) + 100};Bottom=${parseInt(loc[1]) + 80};" subject="EAID_${node.key.replace(/\s/g, '_')}" />\n`;
  });

  // Añadir relaciones (asociaciones, composiciones, agregaciones, recursivas)
  links.forEach((link) => {
    const sourceNode = nodes.find(node => node.key === link.from);
    const targetNode = nodes.find(node => node.key === link.to);

    if (sourceNode && targetNode) {
      let relationContent = '';
      if (link.category === "Association") {
        relationContent = `<UML:Association xmi.id="EAID_Association_${sourceNode.key}_to_${targetNode.key}" visibility="public">
            <UML:Association.connection>
              <UML:AssociationEnd type="EAID_${sourceNode.key.replace(/\s/g, '_')}" visibility="public"/>
              <UML:AssociationEnd type="EAID_${targetNode.key.replace(/\s/g, '_')}" visibility="public"/>
            </UML:Association.connection>
          </UML:Association>\n`;
      } else if (link.category === "Composition") {
        relationContent = `<UML:Association xmi.id="EAID_Composition_${sourceNode.key}_to_${targetNode.key}" visibility="public">
            <UML:Association.connection>
              <UML:AssociationEnd type="EAID_${sourceNode.key.replace(/\s/g, '_')}" visibility="public"/>
              <UML:AssociationEnd type="EAID_${targetNode.key.replace(/\s/g, '_')}" visibility="public" aggregation="composite"/>
            </UML:Association.connection>
          </UML:Association>\n`;
      } else if (link.category === "Aggregation") {
        relationContent = `<UML:Association xmi.id="EAID_Aggregation_${sourceNode.key}_to_${targetNode.key}" visibility="public">
            <UML:Association.connection>
              <UML:AssociationEnd type="EAID_${sourceNode.key.replace(/\s/g, '_')}" visibility="public"/>
              <UML:AssociationEnd type="EAID_${targetNode.key.replace(/\s/g, '_')}" visibility="public" aggregation="shared"/>
            </UML:Association.connection>
          </UML:Association>\n`;
      }

      // Añadir relaciones al diagrama como elementos gráficos con la geometría
      const fromLoc = sourceNode.loc.split(" ");
      const toLoc = targetNode.loc.split(" ");
      const linkGeometry = `SX=${fromLoc[0]};SY=${fromLoc[1]};EX=${toLoc[0]};EY=${toLoc[1]};`;
      xmiContent += relationContent;
      xmiContent += `<UML:DiagramElement geometry="${linkGeometry}" subject="EAID_${link.category}_${sourceNode.key}_to_${targetNode.key}" style="Hidden=0;" />\n`;
    }
  });

  // Finalizar el modelo
  xmiContent += `
      </UML:Namespace.ownedElement>
    </UML:Model>
  </XMI.content>
  <UML:Diagram name="GoJS Diagram" xmi.id="EA_Diagram" diagramType="ClassDiagram">
    <UML:Diagram.element>
      ${nodes.map(node => `<UML:DiagramElement geometry="Left=${node.loc.split(" ")[0]};Top=${node.loc.split(" ")[1]};Right=190;Bottom=160;" subject="EAID_${node.key.replace(/\s/g, '_')}" />`).join('\n')}
    </UML:Diagram.element>
  </UML:Diagram>
</XMI>`;

  // Descargar el archivo generado
  const blob = new Blob([xmiContent], { type: 'application/xml' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'diagram.xmi';
  link.click();
}
