// Transparent shadow-catcher — receives shadows from items, shows them against the background.
// The flashlight ray still hits y=0.48 (this plane's world position).
export default function Table() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.48, 0]}
      receiveShadow
    >
      <planeGeometry args={[5, 4]} />
      <shadowMaterial transparent opacity={0.5} />
    </mesh>
  )
}
