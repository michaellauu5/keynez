import { useCanvasState } from '@/hooks/useCanvasState';
import { CanvasToolbar } from '@/components/canvas/CanvasToolbar';
import { CanvasArea } from '@/components/canvas/CanvasArea';
import { Header } from '@/components/landing/Header';

export default function ResearchCanvas() {
  const {
    elements,
    connectors,
    selectedIds,
    zoom,
    connectorMode,
    connectorStart,
    canUndo,
    canRedo,
    addStickyNote,
    addTextBox,
    addGroup,
    moveElement,
    updateElement,
    removeElement,
    selectElement,
    clearSelection,
    addConnector,
    removeConnector,
    setConnectorMode,
    setZoom,
    clearCanvas,
    saveToStorage,
    loadFromStorage,
    undo,
    redo,
    exportToPDF,
  } = useCanvasState();

  const handleConnectorSelect = (id: string) => {
    // For connectors, just toggle selection
    if (selectedIds.includes(id)) {
      clearSelection();
    } else {
      selectElement(id, false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />
      <CanvasToolbar
        zoom={zoom}
        connectorMode={connectorMode}
        canUndo={canUndo}
        canRedo={canRedo}
        elementCount={elements.length}
        onAddStickyNote={addStickyNote}
        onAddTextBox={addTextBox}
        onAddGroup={addGroup}
        onToggleConnectorMode={() => setConnectorMode(!connectorMode)}
        onClearCanvas={clearCanvas}
        onSave={saveToStorage}
        onLoad={loadFromStorage}
        onExportPDF={exportToPDF}
        onZoomChange={setZoom}
        onUndo={undo}
        onRedo={redo}
      />
      <CanvasArea
        elements={elements}
        connectors={connectors}
        selectedIds={selectedIds}
        zoom={zoom}
        connectorMode={connectorMode}
        connectorStart={connectorStart}
        onMoveElement={moveElement}
        onSelectElement={selectElement}
        onClearSelection={clearSelection}
        onUpdateElement={updateElement}
        onRemoveElement={removeElement}
        onSelectConnector={handleConnectorSelect}
        onRemoveConnector={removeConnector}
      />
    </div>
  );
}
