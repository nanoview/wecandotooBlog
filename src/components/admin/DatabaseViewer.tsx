import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Database, 
  Edit, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Search,
  Eye,
  Download,
  Upload,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TableInfo {
  table_name: string;
  table_schema: string;
  table_type: string;
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  is_primary_key: boolean;
}

interface TableData {
  [key: string]: any;
}

const DatabaseViewer: React.FC = () => {
  const { toast } = useToast();
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCell, setEditingCell] = useState<{row: number, column: string} | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [newRow, setNewRow] = useState<TableData>({});

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      loadTableStructure();
      loadTableData();
    }
  }, [selectedTable, currentPage]);

  const loadTables = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_database_tables');
      
      if (error) {
        // Fallback to information_schema query
        const { data: tablesData, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name, table_schema, table_type')
          .eq('table_schema', 'public')
          .order('table_name');

        if (tablesError) {
          // Manual query as last resort
          const manualTables = [
            'blog_posts', 'users', 'profiles', 'user_roles', 'categories', 
            'tags', 'comments', 'subscriptions', 'newsletter_subscribers'
          ];
          setTables(manualTables.map(name => ({
            table_name: name,
            table_schema: 'public',
            table_type: 'BASE TABLE'
          })));
        } else {
          setTables(tablesData || []);
        }
      } else {
        setTables(data || []);
      }
    } catch (error) {
      console.error('Error loading tables:', error);
      toast({
        title: "Error",
        description: "Failed to load database tables",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTableStructure = async () => {
    if (!selectedTable) return;

    try {
      const { data, error } = await supabase
        .from('information_schema.columns')
        .select(`
          column_name,
          data_type,
          is_nullable,
          column_default
        `)
        .eq('table_name', selectedTable)
        .eq('table_schema', 'public')
        .order('ordinal_position');

      if (error) throw error;

      // Get primary key info
      const { data: pkData } = await supabase
        .from('information_schema.key_column_usage')
        .select('column_name')
        .eq('table_name', selectedTable)
        .eq('table_schema', 'public');

      const primaryKeys = pkData?.map(pk => pk.column_name) || [];

      const columnsWithPK = (data || []).map(col => ({
        ...col,
        is_primary_key: primaryKeys.includes(col.column_name)
      }));

      setColumns(columnsWithPK);
    } catch (error) {
      console.error('Error loading table structure:', error);
      toast({
        title: "Error",
        description: "Failed to load table structure",
        variant: "destructive"
      });
    }
  };

  const loadTableData = async () => {
    if (!selectedTable) return;

    setLoading(true);
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      const { data, error } = await supabase
        .from(selectedTable)
        .select('*')
        .range(offset, offset + itemsPerPage - 1);

      if (error) throw error;
      setTableData(data || []);
    } catch (error) {
      console.error('Error loading table data:', error);
      toast({
        title: "Error",
        description: `Failed to load data from ${selectedTable}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCellEdit = (rowIndex: number, columnName: string, currentValue: any) => {
    setEditingCell({ row: rowIndex, column: columnName });
    setEditValue(currentValue?.toString() || '');
  };

  const handleSaveCell = async () => {
    if (!editingCell || !selectedTable) return;

    const row = tableData[editingCell.row];
    const primaryKeyCol = columns.find(col => col.is_primary_key);
    
    if (!primaryKeyCol) {
      toast({
        title: "Error",
        description: "Cannot update row without primary key",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from(selectedTable)
        .update({ [editingCell.column]: editValue })
        .eq(primaryKeyCol.column_name, row[primaryKeyCol.column_name]);

      if (error) throw error;

      // Update local state
      const updatedData = [...tableData];
      updatedData[editingCell.row][editingCell.column] = editValue;
      setTableData(updatedData);

      toast({
        title: "Success",
        description: "Cell updated successfully"
      });

      setEditingCell(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAddRow = async () => {
    if (!selectedTable) return;

    try {
      const { error } = await supabase
        .from(selectedTable)
        .insert(newRow);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Row added successfully"
      });

      setIsAddingRow(false);
      setNewRow({});
      loadTableData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteRow = async (rowIndex: number) => {
    if (!selectedTable) return;

    const row = tableData[rowIndex];
    const primaryKeyCol = columns.find(col => col.is_primary_key);
    
    if (!primaryKeyCol) {
      toast({
        title: "Error",
        description: "Cannot delete row without primary key",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from(selectedTable)
        .delete()
        .eq(primaryKeyCol.column_name, row[primaryKeyCol.column_name]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Row deleted successfully"
      });

      loadTableData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const exportToCSV = () => {
    if (!tableData.length) return;

    const headers = columns.map(col => col.column_name).join(',');
    const rows = tableData.map(row => 
      columns.map(col => {
        const value = row[col.column_name];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTable}_export.csv`;
    a.click();
  };

  const filteredData = tableData.filter(row =>
    Object.values(row).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getDataTypeColor = (dataType: string) => {
    switch (dataType.toLowerCase()) {
      case 'integer': case 'bigint': case 'smallint':
        return 'bg-blue-100 text-blue-800';
      case 'text': case 'varchar': case 'character varying':
        return 'bg-green-100 text-green-800';
      case 'boolean':
        return 'bg-purple-100 text-purple-800';
      case 'timestamp': case 'timestamptz': case 'date':
        return 'bg-orange-100 text-orange-800';
      case 'json': case 'jsonb':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            Database Viewer
          </h2>
          <p className="text-muted-foreground">
            View and edit all database tables with real-time data management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadTables} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {selectedTable && (
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="tables" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tables">Tables Overview</TabsTrigger>
          <TabsTrigger value="data" disabled={!selectedTable}>
            Table Data {selectedTable && `(${selectedTable})`}
          </TabsTrigger>
          <TabsTrigger value="structure" disabled={!selectedTable}>
            Table Structure
          </TabsTrigger>
        </TabsList>

        {/* Tables Overview */}
        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Tables</CardTitle>
              <CardDescription>
                Select a table to view and edit its data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map((table) => (
                  <Card
                    key={table.table_name}
                    className={`cursor-pointer transition-colors hover:bg-muted ${
                      selectedTable === table.table_name ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedTable(table.table_name)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{table.table_name}</CardTitle>
                      <Badge variant="secondary" className="w-fit">
                        {table.table_type.replace('BASE ', '')}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Schema: {table.table_schema}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTable(table.table_name);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Table Data */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Table Data: {selectedTable}</CardTitle>
                  <CardDescription>
                    View and edit records in {selectedTable}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search records..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsAddingRow(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Row
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {columns.map((column) => (
                            <TableHead key={column.column_name} className="min-w-32">
                              <div className="flex items-center gap-2">
                                {column.column_name}
                                {column.is_primary_key && (
                                  <Badge variant="secondary" className="text-xs">PK</Badge>
                                )}
                              </div>
                            </TableHead>
                          ))}
                          <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isAddingRow && (
                          <TableRow>
                            {columns.map((column) => (
                              <TableCell key={column.column_name}>
                                <Input
                                  placeholder={`Enter ${column.column_name}`}
                                  value={newRow[column.column_name] || ''}
                                  onChange={(e) => setNewRow(prev => ({
                                    ...prev,
                                    [column.column_name]: e.target.value
                                  }))}
                                  className="text-sm"
                                />
                              </TableCell>
                            ))}
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button size="sm" variant="outline" onClick={handleAddRow}>
                                  <Save className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => {
                                    setIsAddingRow(false);
                                    setNewRow({});
                                  }}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                        {filteredData.map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {columns.map((column) => (
                              <TableCell key={column.column_name}>
                                {editingCell?.row === rowIndex && editingCell?.column === column.column_name ? (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      className="text-sm"
                                    />
                                    <Button size="sm" variant="outline" onClick={handleSaveCell}>
                                      <Save className="w-3 h-3" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      onClick={() => setEditingCell(null)}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div
                                    className="cursor-pointer hover:bg-muted p-1 rounded text-sm"
                                    onClick={() => handleCellEdit(rowIndex, column.column_name, row[column.column_name])}
                                  >
                                    {row[column.column_name]?.toString() || <span className="text-muted-foreground">NULL</span>}
                                  </div>
                                )}
                              </TableCell>
                            ))}
                            <TableCell>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteRow(rowIndex)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)} to{' '}
                      {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm">Page {currentPage}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={filteredData.length < itemsPerPage}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Table Structure */}
        <TabsContent value="structure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Table Structure: {selectedTable}</CardTitle>
              <CardDescription>
                Column definitions and constraints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Column Name</TableHead>
                    <TableHead>Data Type</TableHead>
                    <TableHead>Nullable</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Key</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {columns.map((column) => (
                    <TableRow key={column.column_name}>
                      <TableCell className="font-medium">{column.column_name}</TableCell>
                      <TableCell>
                        <Badge className={getDataTypeColor(column.data_type)}>
                          {column.data_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={column.is_nullable === 'YES' ? 'secondary' : 'outline'}>
                          {column.is_nullable}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {column.column_default || 'None'}
                      </TableCell>
                      <TableCell>
                        {column.is_primary_key && (
                          <Badge variant="default">Primary Key</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabaseViewer;
