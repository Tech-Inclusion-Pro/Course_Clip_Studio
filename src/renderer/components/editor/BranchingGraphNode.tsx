import { Handle, Position, type NodeProps } from '@xyflow/react'

interface BranchingNodeData {
  title: string
  moduleTitle: string
  blockCount: number
  hasBranching: boolean
  isStart: boolean
  isEnd: boolean
}

export function BranchingGraphNode({ data }: NodeProps & { data: BranchingNodeData }): JSX.Element {
  const nodeData = data as unknown as BranchingNodeData
  const bgColor = nodeData.isStart
    ? '#dcfce7'
    : nodeData.isEnd
      ? '#fecaca'
      : nodeData.hasBranching
        ? '#ede9fe'
        : '#f1f5f9'

  const borderColor = nodeData.isStart
    ? '#16a34a'
    : nodeData.isEnd
      ? '#dc2626'
      : nodeData.hasBranching
        ? '#7c3aed'
        : '#94a3b8'

  return (
    <div
      className="px-4 py-3 rounded-lg border-2 shadow-sm min-w-[160px]"
      style={{ backgroundColor: bgColor, borderColor }}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      <div className="text-xs font-semibold text-gray-800 truncate">{nodeData.title}</div>
      <div className="text-[10px] text-gray-500 mt-0.5">{nodeData.moduleTitle}</div>
      <div className="text-[9px] text-gray-400 mt-1">
        {nodeData.blockCount} block{nodeData.blockCount !== 1 ? 's' : ''}
        {nodeData.hasBranching && ' · Branching'}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  )
}
