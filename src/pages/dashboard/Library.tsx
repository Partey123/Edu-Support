import { Library as LibraryIcon, BookOpen, Users, Search, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const booksData = [
  { title: "Mathematics for JHS", author: "Ghana Education Service", copies: 45, available: 32, category: "Textbook" },
  { title: "Integrated Science", author: "GES Publications", copies: 40, available: 28, category: "Textbook" },
  { title: "English Language", author: "Longman", copies: 50, available: 41, category: "Textbook" },
  { title: "Things Fall Apart", author: "Chinua Achebe", copies: 20, available: 8, category: "Literature" },
  { title: "Animal Farm", author: "George Orwell", copies: 15, available: 12, category: "Literature" },
  { title: "Ghana History", author: "Prof. Adu Boahen", copies: 25, available: 20, category: "Reference" },
];

const Library = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Library</h1>
          <p className="text-muted-foreground">Manage books and library resources</p>
        </div>
        <Button variant="hero">
          <Plus className="w-4 h-4 mr-2" />
          Add Book
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Books", value: "2,450", icon: BookOpen, color: "text-primary" },
          { label: "Available", value: "1,890", icon: LibraryIcon, color: "text-emerald-600" },
          { label: "Borrowed", value: "560", icon: Users, color: "text-amber-600" },
          { label: "Overdue", value: "23", icon: BookOpen, color: "text-destructive" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="glass-card rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search books by title, author, or ISBN..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-background/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button variant="outline" className="glass-button">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {booksData.map((book) => (
          <div key={book.title} className="glass-card rounded-xl p-5 hover:shadow-card-hover transition-all">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-20 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground line-clamp-2">{book.title}</h3>
                <p className="text-sm text-muted-foreground">{book.author}</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary mt-2 inline-block">
                  {book.category}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-muted-foreground">Available</span>
              <span className="font-semibold text-foreground">{book.available} / {book.copies}</span>
            </div>
            
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${(book.available / book.copies) * 100}%` }} 
              />
            </div>

            <Button variant="outline" className="w-full glass-button">
              Issue Book
            </Button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Library;
