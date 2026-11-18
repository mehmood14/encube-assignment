const railPositions = [0.22, -0.22] as const;
const supportAngles = [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2];

export function PropellerGuardModel({
  yaw,
  pitch,
}: {
  yaw: number;
  pitch: number;
}) {
  return (
    <group rotation={[pitch, yaw, 0]}>
      {railPositions.map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2, 0.065, 10, 96]} />
          <meshStandardMaterial
            color={y > 0 ? "#778d91" : "#52696e"}
            roughness={0.48}
            metalness={0.12}
          />
        </mesh>
      ))}
      {supportAngles.map((angle) => (
        <mesh
          key={angle}
          position={[2 * Math.cos(angle), 0, 2 * Math.sin(angle)]}
        >
          <cylinderGeometry args={[0.055, 0.055, 0.44, 10]} />
          <meshStandardMaterial color="#9aa9a8" roughness={0.55} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.66, 0.07, 1.91]}
          rotation={[0, -side * 1.05, 0]}
        >
          <boxGeometry args={[0.12, 0.13, 1.08]} />
          <meshStandardMaterial color="#8b9b9d" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 0, 2.14]}>
        <boxGeometry args={[0.12, 0.13, 0.36]} />
        <meshStandardMaterial color="#778d91" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.01, 2.39]}>
        <boxGeometry args={[0.62, 0.13, 0.28]} />
        <meshStandardMaterial color="#657b7f" roughness={0.5} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.22, 0.13, 2.39]}>
          <boxGeometry args={[0.12, 0.22, 0.28]} />
          <meshStandardMaterial color="#bd8a5d" roughness={0.55} />
        </mesh>
      ))}
      <mesh position={[0, -0.11, 2.39]}>
        <boxGeometry args={[0.4, 0.06, 0.28]} />
        <meshStandardMaterial color="#87989a" roughness={0.5} />
      </mesh>
    </group>
  );
}
