
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, UserPlus, Tag, Trash2, Edit, RefreshCw } from "lucide-react";
import { useContacts } from "@/hooks/useContacts";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const contactSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  phone: z.string().min(10, { message: "Digite um número de telefone válido" }),
  tags: z.string().optional()
});

export function ContactList() {
  const { contacts, loading, syncingContacts, syncContacts, addContact, updateContact, deleteContact } = useContacts();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<string | null>(null);

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      phone: "",
      tags: ""
    }
  });

  const handleSync = async () => {
    await syncContacts();
  };

  const handleAddContact = async (data: z.infer<typeof contactSchema>) => {
    try {
      // Prepara os dados do contato
      const newContact = {
        name: data.name,
        phone: data.phone,
        lastContact: new Date().toISOString().split('T')[0],
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        status: "active" as const
      };
      
      await addContact(newContact);
      setIsAddDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Erro ao adicionar contato:', error);
    }
  };

  const handleEditContact = async (data: z.infer<typeof contactSchema>) => {
    if (!editingContact) return;
    
    try {
      const updates = {
        name: data.name,
        phone: data.phone,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : []
      };
      
      await updateContact(editingContact, updates);
      setEditingContact(null);
      form.reset();
    } catch (error) {
      console.error('Erro ao atualizar contato:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteContact(id);
    } catch (error) {
      console.error('Erro ao excluir contato:', error);
    }
  };

  const openEditDialog = (contact: any) => {
    form.reset({
      name: contact.name,
      phone: contact.phone,
      tags: contact.tags.join(', ')
    });
    setEditingContact(contact.id);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <CardTitle>Contatos</CardTitle>
          <div className="flex space-x-2">
            <Button className="w-full sm:w-auto" disabled>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Contato
            </Button>
            <Button variant="outline" className="w-full sm:w-auto" disabled>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sincronizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-3 bg-muted rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <CardTitle>Contatos</CardTitle>
        <div className="flex space-x-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Contato
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Contato</DialogTitle>
                <DialogDescription>
                  Preencha as informações abaixo para adicionar um novo contato.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddContact)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do contato" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="+55 (00) 00000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (separadas por vírgula)</FormLabel>
                        <FormControl>
                          <Input placeholder="cliente, vip, lead" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Adicionar</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={handleSync}
            disabled={syncingContacts}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncingContacts ? 'animate-spin' : ''}`} />
            {syncingContacts ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {contacts.length > 0 ? contacts.map((contact) => (
          <div
            key={contact.id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">{contact.name}</h3>
                <p className="text-sm text-muted-foreground">{contact.phone}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex flex-wrap gap-2">
                {contact.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 sm:flex-none"
                  onClick={() => openEditDialog(contact)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="flex-1 sm:flex-none"
                  onClick={() => handleDelete(contact.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center p-6 border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-3">Nenhum contato encontrado</p>
            <p className="mb-4">Adicione um novo contato ou sincronize com o WhatsApp</p>
            <div className="flex justify-center gap-3">
              <Button 
                size="sm" 
                onClick={() => setIsAddDialogOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Contato
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleSync}
                disabled={syncingContacts}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncingContacts ? 'animate-spin' : ''}`} />
                Sincronizar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Dialog para Edição de Contato */}
      <Dialog open={!!editingContact} onOpenChange={(open) => !open && setEditingContact(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Contato</DialogTitle>
            <DialogDescription>
              Edite as informações do contato.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditContact)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do contato" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="+55 (00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (separadas por vírgula)</FormLabel>
                    <FormControl>
                      <Input placeholder="cliente, vip, lead" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Salvar Alterações</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
