/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { UploadIcon } from 'lucide-react'
import Papa from 'papaparse'
import { useState } from 'react'
import { useDropzone } from 'react-dropzone'

import { Dialog } from '@/components/ui/dialog'

import { ModalListFile } from './modal-list-file'

interface DataRow {
  PK: string
  Niv: string
  TpConv: string
  Gru: string
  Redef: boolean
  Tam: string
  [key: string]: any
}

export default function UploaderFile() {
  const [files, setFiles] = useState<File[]>([])
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const queryClient = useQueryClient()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [uploadComplete, setUploadComplete] = useState(false)

  // TODO:v1 Função para processar o CSV com async/await
  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const parsedData = await new Promise<DataRow[]>((resolve, reject) => {
        Papa.parse<DataRow>(file, {
          header: true,
          complete: (result) => resolve(result.data),
          error: (error) => reject(error),
        })
      })

      // Processar os dados CSV e obter o status
      const { processedData, status } = await processCSV(parsedData)

      // Fazer o upload dos dados e salvar no banco de dados
      const response = await axios.post('/api/files/create', {
        files: [
          {
            arquivoCSV: processedData,
            fileName: file.name,
            description: 'Descrição opcional',
            status,
          },
        ],
      })

      if (response.status !== 200) {
        throw new Error('Erro ao salvar os dados.')
      }

      return response.data
    },
    onMutate: (file) => {
      setProgress((prev) => ({ ...prev, [file.name]: 0 }))
      setIsUploading(true)
    },
    onSuccess: (data, file) => {
      setProgress((prev) => ({ ...prev, [file.name]: 100 }))
    },
    onError: () => {
      setIsUploading(false)
    },
    onSettled: () => {
      // Se todos os arquivos foram processados
      if (files.length === 0) {
        setIsUploading(false)
        setUploadComplete(true)
      }
    },
  })

  // TODO:v1 funcional
  // const processCSV = async (
  //   data: DataRow[],
  // ): Promise<{
  //   processedData: DataRow[]
  //   tamTotalDCL: number
  //   sumTamC: number
  //   status: string
  // }> => {
  //   let nivValorPK = ''
  //   let tamTotalDCL = 0
  //   let sumTamC = 0

  //   data.forEach((row) => {
  //     if (row.TpConv !== 'DCL') {
  //       row.TpConv = '' // Limpa o valor se não for "DCL"
  //     }
  //   })

  //   // Loop único para processar dados e calcular tamTotalDCL
  //   data.forEach((row) => {
  //     if (row.PK === 'PK') {
  //       nivValorPK = row.Niv
  //     }

  //     if (row.TpConv === 'DCL') {
  //       tamTotalDCL += parseFloat(row.Tam) || 0
  //     }
  //   })

  //   // Loop para atualizar TpConv e calcular sumTamC
  //   data.forEach((row) => {
  //     if (row.Niv === '#') {
  //       row.TpConv = ''
  //     } else if (row.Niv === '') {
  //       row.TpConv = '' // Não preenche se Niv estiver
  //     } else if (row.Gru === 'G' && row.Redef) {
  //       row.TpConv = 'N'
  //     } else if (row.Niv === nivValorPK && row.TpConv !== 'N') {
  //       row.TpConv = 'C'
  //     } else if (row.TpConv === '') {
  //       row.TpConv = 'N'
  //     }

  //     // Calcular a soma de Tam para "C"
  //     if (row.TpConv === 'C') {
  //       sumTamC += parseFloat(row.Tam) || 0
  //     }
  //   })

  //   // Determinar o status com base em tamTotalDCL e sumTamC
  //   const status = tamTotalDCL !== sumTamC ? 'Atenção' : 'Conferido'

  //   return { processedData: data, tamTotalDCL, sumTamC, status }
  // }

  // TODO:v2 Função para verificar multi-layouts niv 1
  // const processCSV = async (
  //   data: DataRow[],
  // ): Promise<{
  //   processedData: DataRow[]
  //   tamTotalDCL: number
  //   sumTamC: number
  //   status: string
  // }> => {
  //   let nivValorPK = ''
  //   let tamTotalDCL = 0
  //   let sumTamC = 0
  //   let pkFound = false // Variável para verificar se algum valor PK foi encontrado

  //   // Primeiro loop: Contar quantos "Niv = 1" existem e limpar o TpConv se não for "DCL"
  //   let nivCount1 = 0

  //   data.forEach((row) => {
  //     if (row.TpConv !== 'DCL') {
  //       row.TpConv = '' // Limpa o valor se não for "DCL"
  //     }

  //     if (row.Niv === '1') {
  //       nivCount1 += 1
  //     }
  //   })

  //   // Verificar se existem dois "Niv = 1" e marcar o índice do segundo
  //   let secondNiv1Index = -1
  //   if (nivCount1 >= 2) {
  //     let count = 0
  //     data.forEach((row, index) => {
  //       if (row.Niv === '1') {
  //         count += 1
  //         if (count === 2) {
  //           secondNiv1Index = index
  //         }
  //       }
  //     })
  //   }

  //   // Segundo loop: Processar os dados e calcular tamTotalDCL
  //   data.forEach((row) => {
  //     if (row.PK === 'PK') {
  //       nivValorPK = row.Niv
  //       pkFound = true // Indica que o valor PK foi encontrado
  //     }

  //     if (row.TpConv === 'DCL') {
  //       tamTotalDCL += parseFloat(row.Tam) || 0
  //     }
  //   })

  //   // Terceiro loop: Atualizar TpConv, calcular sumTamC e aplicar a regra especial a partir do segundo "Niv = 1"
  //   data.forEach((row, index) => {
  //     if (secondNiv1Index !== -1 && index >= secondNiv1Index) {
  //       // Se estivermos após o segundo "Niv = 1", TpConv será 'N' e ignoraremos outras regras
  //       row.TpConv = 'N'
  //       return // Ignora as outras condições
  //     }

  //     // Regras normais para as linhas antes do segundo "Niv = 1"
  //     if (row.Niv === '#') {
  //       row.TpConv = ''
  //     } else if (row.Niv === '') {
  //       row.TpConv = '' // Não preenche se Niv estiver vazio
  //     } else if (row.Gru === 'G' && row.Redef) {
  //       row.TpConv = 'N'
  //     } else if (row.Niv === nivValorPK && row.TpConv !== 'N') {
  //       row.TpConv = 'C'
  //     } else if (row.TpConv === '') {
  //       row.TpConv = 'N'
  //     }

  //     // Calcular a soma de Tam para "C"
  //     if (row.TpConv === 'C') {
  //       sumTamC += parseFloat(row.Tam) || 0
  //     }
  //   })

  //   // Determinar o status com base nas novas condições
  //   let status = 'Atenção'

  //   if (!pkFound) {
  //     // Se nenhum valor "PK" foi encontrado, o status será "Atenção-PK"
  //     status = 'Atenção-PK'
  //   } else if (nivCount1 >= 2) {
  //     // Se houver dois Niv = 1, temos duas condições:
  //     if (tamTotalDCL === sumTamC) {
  //       status = 'Conferido-Multi' // Se tamTotalDCL for igual a sumTamC
  //     } else {
  //       status = 'Atenção-Multi' // Se tamTotalDCL for diferente de sumTamC
  //     }
  //   } else if (tamTotalDCL === sumTamC) {
  //     status = 'Conferido' // Caso normal onde tamTotalDCL é igual a sumTamC
  //   }

  //   return { processedData: data, tamTotalDCL, sumTamC, status }
  // }

  // TODO:V3 - Função para verificar sobreposição de layouts
  const processCSV = async (
    data: DataRow[],
  ): Promise<{
    processedData: DataRow[]
    tamTotalDCL: number
    sumTamC: number
    status: string
  }> => {
    let nivValorPK = ''
    let tamTotalDCL = 0
    let sumTamC = 0
    let pkFound = false // Variável para verificar se algum valor PK foi encontrado
    let overlapDetected = false // Verificar se há sobreposição

    // Primeiro loop: Contar quantos "Niv = 1" existem e limpar o TpConv se não for "DCL"
    let nivCount1 = 0

    data.forEach((row) => {
      if (row.TpConv !== 'DCL') {
        row.TpConv = '' // Limpa o valor se não for "DCL"
      }

      if (row.Niv === '1') {
        nivCount1 += 1
      }
    })

    // Verificar se existem dois "Niv = 1" e marcar o índice do segundo
    let secondNiv1Index = -1
    if (nivCount1 >= 2) {
      let count = 0
      data.forEach((row, index) => {
        if (row.Niv === '1') {
          count += 1
          if (count === 2) {
            secondNiv1Index = index
          }
        }
      })
    }

    // Segundo loop: Processar os dados e calcular tamTotalDCL
    data.forEach((row, index) => {
      if (row.PK === 'PK') {
        nivValorPK = row.Niv
        pkFound = true // Indica que o valor PK foi encontrado

        // Verificar se a linha de elementos "E" logo abaixo contém sobreposição com as colunas AK
        for (let i = index + 1; i < data.length; i++) {
          const nextRow = data[i]
          if (nextRow.PK === 'E') {
            // Verifica se a coluna AK tem sobreposição com elementos "E"
            if (nextRow.AK && nextRow.PK === 'E') {
              overlapDetected = true
            }
          } else {
            break // Parar quando a sequência de elementos "E" acabar
          }
        }
      }

      if (row.TpConv === 'DCL') {
        tamTotalDCL += parseFloat(row.Tam) || 0
      }
    })

    // Terceiro loop: Atualizar TpConv, calcular sumTamC e aplicar a regra especial a partir do segundo "Niv = 1"
    data.forEach((row, index) => {
      if (secondNiv1Index !== -1 && index >= secondNiv1Index) {
        // Se estivermos após o segundo "Niv = 1", TpConv será 'N' e ignoraremos outras regras
        row.TpConv = 'N'
        return // Ignora as outras condições
      }

      // Regras normais para as linhas antes do segundo "Niv = 1"
      if (row.Niv === '#') {
        row.TpConv = ''
      } else if (row.Niv === '') {
        row.TpConv = '' // Não preenche se Niv estiver vazio
      } else if (row.Gru === 'G' && row.Redef) {
        row.TpConv = 'N'
      } else if (row.Niv === nivValorPK && row.TpConv !== 'N') {
        row.TpConv = 'C'
      } else if (row.TpConv === '') {
        row.TpConv = 'N'
      }

      // Calcular a soma de Tam para "C"
      if (row.TpConv === 'C') {
        sumTamC += parseFloat(row.Tam) || 0
      }
    })

    // Determinar o status com base nas novas condições
    let status = 'Atenção'

    if (overlapDetected) {
      // Se for detectada sobreposição, o status será "Atenção-Sobreposição"
      status = 'Atenção-Sobreposição'
    } else if (!pkFound) {
      // Se nenhum valor "PK" foi encontrado, o status será "Atenção-PK"
      status = 'Atenção-PK'
    } else if (nivCount1 >= 2) {
      // Se houver dois Niv = 1, temos duas condições:
      if (tamTotalDCL === sumTamC) {
        status = 'Conferido-Multi' // Se tamTotalDCL for igual a sumTamC
      } else {
        status = 'Atenção-Multi' // Se tamTotalDCL for diferente de sumTamC
      }
    } else if (tamTotalDCL === sumTamC) {
      status = 'Conferido' // Caso normal onde tamTotalDCL é igual a sumTamC
    }

    return { processedData: data, tamTotalDCL, sumTamC, status }
  }

  const onDrop = (acceptedFiles: File[]) => {
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles, ...acceptedFiles]
      if (!isModalOpen) {
        setIsModalOpen(true)
      }
      return newFiles
    })
  }

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    multiple: true,
    disabled: isUploading,
    accept: {
      'text/csv': ['.csv'],
    },
  })

  const handleUpload = async () => {
    setIsUploading(true)
    setUploadComplete(false)

    try {
      // Use Promise.all para garantir que todos os arquivos sejam processados
      await Promise.all(files.map((file) => mutation.mutateAsync(file)))

      // Atualize a lista após todos os arquivos serem processados
      queryClient.invalidateQueries({ queryKey: ['files'] })
      setFiles([])
    } catch (error) {
      console.error('Erro ao fazer upload dos arquivos:', error)
    } finally {
      setIsModalOpen(false)
    }
  }

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  }

  const clearSelection = () => {
    setFiles([])
    setIsModalOpen(false)
  }

  return (
    <div className="my-8">
      <div className="flex items-start space-x-4">
        <div className="flex-1">
          <div
            {...getRootProps({
              className: `border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer ${isUploading ? 'pointer-events-none' : ''}`,
            })}
          >
            <input {...getInputProps()} />
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-1 text-sm text-gray-600">
              Clique ou arraste arquivos aqui para fazer upload
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Arquivos permitidos: CSV
            </p>
          </div>

          {/* Modal com os arquivos selecionados */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <ModalListFile
              files={files}
              progress={progress}
              onRemoveFile={removeFile}
              onClearSelection={clearSelection}
              onUpload={handleUpload}
              isUploading={isUploading}
              openFileDialog={open}
            />
          </Dialog>
        </div>
      </div>
    </div>
  )
}
