import { useMemo, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from 'dagre'
import { useCourseStore } from '@/stores/useCourseStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { extractBranchingGraph } from '@/lib/branching-graph'
import { BranchingGraphNode } from './BranchingGraphNode'

const nodeTypes = { lesson: BranchingGraphNode }

const NODE_WIDTH = 200
const NODE_HEIGHT = 80

function layoutGraph(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 60 })

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  }
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target)
  }

  dagre.layout(g)

  return nodes.map((node) => {
    const dagreNode = g.node(node.id)
    return {
      ...node,
      position: {
        x: dagreNode.x - NODE_WIDTH / 2,
        y: dagreNode.y - NODE_HEIGHT / 2
      }
    }
  })
}

export function BranchingGraphView(): JSX.Element {
  const course = useCourseStore((s) => s.courses.find((c) => c.id === s.activeCourseId))
  const setActiveModule = useEditorStore((s) => s.setActiveModule)
  const setActiveLesson = useEditorStore((s) => s.setActiveLesson)
  const toggleBranchingGraph = useEditorStore((s) => s.toggleBranchingGraph)

  const graphData = useMemo(() => {
    if (!course) return { nodes: [] as Node[], edges: [] as Edge[] }
    const { nodes: graphNodes, edges: graphEdges } = extractBranchingGraph(course)

    const flowNodes: Node[] = graphNodes.map((n) => ({
      id: n.id,
      type: 'lesson',
      position: n.position,
      data: n.data
    }))

    const flowEdges: Edge[] = graphEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: !!e.label,
      style: e.label ? { stroke: '#7c3aed' } : { stroke: '#94a3b8' }
    }))

    const laidOut = layoutGraph(flowNodes, flowEdges)
    return { nodes: laidOut, edges: flowEdges }
  }, [course])

  const [nodes, , onNodesChange] = useNodesState(graphData.nodes)
  const [edges, , onEdgesChange] = useEdgesState(graphData.edges)

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (!course) return
      // Find module containing this lesson
      for (const mod of course.modules) {
        const lesson = mod.lessons.find((l) => l.id === node.id)
        if (lesson) {
          setActiveModule(mod.id)
          setActiveLesson(lesson.id)
          toggleBranchingGraph()
          break
        }
      }
    },
    [course, setActiveModule, setActiveLesson, toggleBranchingGraph]
  )

  if (!course) {
    return <div className="flex-1 flex items-center justify-center"><p className="text-sm text-[var(--text-tertiary)]">No course loaded</p></div>
  }

  return (
    <div className="flex-1" style={{ height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}
