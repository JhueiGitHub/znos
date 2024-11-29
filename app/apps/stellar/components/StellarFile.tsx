import { StellarFile } from "@/types";

type Props = {
  files: StellarFile[];
};

export default function FileList({ files }: Props) {
  return (
    <div className="bg-white shadow rounded">
      <table className="w-full">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-left">Size</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id}>
              <td className="px-4 py-2 border-t">{file.name}</td>
              <td className="px-4 py-2 border-t">{file.mimeType}</td>
              <td className="px-4 py-2 border-t">{file.size} bytes</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
