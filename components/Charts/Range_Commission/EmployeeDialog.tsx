import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Input } from "../../../components/ui/input"
import { Button } from "../../../components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Employee {
  name: string
  totalCommission: number
  totalDiligence: number
}

interface EmployeeDialogProps {
  isOpen: boolean
  onClose: () => void
  employees: Employee[]
}

type SortField = 'totalCommission' | 'totalDiligence'
type SortOrder = 'asc' | 'desc'

export default function EmployeeDialog({ isOpen, onClose, employees }: EmployeeDialogProps) {
  const t = useTranslations('EmployeeDialog');
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const itemsPerPage = 10
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  useEffect(() => {
    if (!isOpen) {
      setCurrentPage(1)
      setSearchQuery('')
    }
  }, [isOpen])

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (sortField) {
      const aValue = a[sortField]
      const bValue = b[sortField]
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    }
    return 0
  })

  const paginatedEmployees = sortedEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const formatThaiCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {employees.length > 0 ? (
            <div className="mt-4">
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-4"
              />
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('name')}</TableHead>
                    <TableHead onClick={() => handleSort('totalCommission')} className="cursor-pointer">
                      {t('totalCommission')}
                      {sortField === 'totalCommission' && (
                        sortOrder === 'asc' ? <ChevronUpIcon className="inline ml-1 h-4 w-4" /> : <ChevronDownIcon className="inline ml-1 h-4 w-4" />
                      )}
                    </TableHead>
                    <TableHead onClick={() => handleSort('totalDiligence')} className="cursor-pointer">
                      {t('totalDiligence')}
                      {sortField === 'totalDiligence' && (
                        sortOrder === 'asc' ? <ChevronUpIcon className="inline ml-1 h-4 w-4" /> : <ChevronDownIcon className="inline ml-1 h-4 w-4" />
                      )}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEmployees.length > 0 ? (
                    paginatedEmployees.map((employee, index) => (
                      <TableRow key={index}>
                        <TableCell>{employee.name}</TableCell>
                        <TableCell>{formatThaiCurrency(employee.totalCommission)}</TableCell>
                        <TableCell>{formatThaiCurrency(employee.totalDiligence)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3}>{t('noEmployeesFound')}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  {t('previous')}
                </Button>
                <span>
                  {t('pageInfo', { current: currentPage, total: totalPages })}
                </span>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  {t('next')}
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <p>{t('noEmployeesInRange')}</p>
          )}
        </DialogDescription>
        <DialogFooter>
          <Button onClick={onClose}>{t('close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
