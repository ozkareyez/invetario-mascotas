import { useState, useRef } from 'react'
import { parseExcel } from '../utils/excelParser'
import { hasConfig } from '../supabase'

export default function RoomScreen({ onCreateRoom, onJoinRoom, loading, error }) {
  const [tab, setTab] = useState('crear')
  const [joinCode, setJoinCode] = useState('')
  const [fileLoading, setFileLoading] = useState(false)
  const [fileError, setFileError] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const handleFile = async (file) => {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['xlsx', 'xls'].includes(ext)) {
      setFileError('Solo se permiten archivos .xlsx o .xls')
      return
    }
    setFileLoading(true)
    setFileError(null)
    try {
      const result = await parseExcel(file)
      const code = await onCreateRoom(result.productos, result.ubicaciones || {})
      if (!code) {
        setFileError('Error al crear la sala')
      }
    } catch (err) {
      setFileError(err.message)
    } finally {
      setFileLoading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  const handleClick = () => inputRef.current?.click()

  const handleInputChange = (e) => {
    const file = e.target.files[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const handleJoin = async (e) => {
    e.preventDefault()
    if (!joinCode.trim()) return
    await onJoinRoom(joinCode.trim().toUpperCase())
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-1">Inventario</h1>
        <p className="text-gray-500 text-center mb-6 text-sm">
          Comparte los datos en tiempo real entre dispositivos
        </p>

        <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setTab('crear')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium touch-manipulation transition-colors ${
              tab === 'crear' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            Crear Sala
          </button>
          <button
            onClick={() => setTab('unirse')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium touch-manipulation transition-colors ${
              tab === 'unirse' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            Unirse a Sala
          </button>
        </div>

        {tab === 'crear' ? (
          <>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleClick}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                dragOver
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-4xl mb-3 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">
                {dragOver ? 'Suelta el archivo aquí' : 'Sube tu Excel para crear una sala'}
              </p>
              <p className="text-gray-400 text-sm mt-1">.xlsx o .xls</p>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleInputChange}
              className="hidden"
            />

            {(fileLoading || loading) && (
              <div className="flex items-center justify-center gap-2 mt-6 text-blue-600">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Creando sala...</span>
              </div>
            )}

            {(fileError || error) && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {fileError || error}
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de la sala
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Ej: ABC123"
                className="w-full px-4 py-3 text-lg text-center font-mono tracking-widest border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                maxLength={6}
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              disabled={!joinCode.trim() || loading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
            >
              {loading ? 'Uniéndose...' : 'Unirse a la sala'}
            </button>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </form>
        )}

        {!hasConfig && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <p className="font-medium mb-1">Supabase no configurado</p>
            <p>
              Para compartir datos entre dispositivos, crea un archivo <code className="text-xs bg-amber-100 px-1 rounded">.env</code> con tus credenciales de Supabase.
              Revisa el archivo <code className="text-xs bg-amber-100 px-1 rounded">.env.example</code> para más detalles.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
