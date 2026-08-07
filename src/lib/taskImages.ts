import { compressImage } from './image'

export async function uploadTaskImage(file: File, _uid: string): Promise<string> {
  return compressImage(file)
}

export async function deleteTaskImage(_url: string) {
  return
}
