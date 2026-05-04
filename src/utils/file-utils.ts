import { Nullable } from "./generic-types";

type HybridNavigator = Navigator & {
  msSaveOrOpenBlob?: (blob: Blob, name: string) => void;
};

function exportString(name: string, content: string) {
  const navigator = window.navigator as HybridNavigator;
  const blob = new Blob([content]);
  if (navigator.msSaveOrOpenBlob) {
    navigator.msSaveOrOpenBlob(blob, name);
  } else {
    const element = window.document.createElement("a");
    element.href = window.URL.createObjectURL(blob);
    element.download = name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}

function acceptFile(): Promise<Nullable<string>> {
  return new Promise((resolve, reject) => {
    const tempElement = document.createElement("input");
    tempElement.type = "file";
    tempElement.accept = "application/json";
    tempElement.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        resolve((e.target?.result as string) || null);
      };
      fileReader.onerror = () => {
        reject(new Error("파일을 읽는 중 오류가 발생했습니다."));
      };
      fileReader.readAsText(file);
    });

    tempElement.click();
  });
}

function acceptFileRaw(accepts: string): Promise<Nullable<File>> {
  return new Promise((resolve, reject) => {
    const tempElement = document.createElement("input");
    tempElement.type = "file";
    tempElement.accept = accepts;
    tempElement.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      resolve(file)
    });

    tempElement.click();
  });
}

export const FileUtil = {
  exportString,
  acceptFile,
  acceptFileRaw
} as const;
