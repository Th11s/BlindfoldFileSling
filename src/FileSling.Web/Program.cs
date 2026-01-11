using Microsoft.AspNetCore.Authorization;

using Th11s.FileSling.Configuration;
using Th11s.FileSling.Services;
using Th11s.FileSling.Web.Components;
using Th11s.FileSling.Web.Endpoints;
using Th11s.FileSling.Web.Security;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");

builder.Services.AddHttpContextAccessor();
builder.Services.AddAuthentication()
    .AddCookie(options =>
    {
#if DEBUG
        options.LoginPath = "/fakelogin";
#else
        options.LoginPath = "/login";
#endif

        options.LogoutPath = "/logout";
        options.EventsType = typeof(FileSlingCookieAuthenticationEvents);
    });
builder.Services.AddScoped<FileSlingCookieAuthenticationEvents>();

builder.Services.AddAuthorization();
builder.Services.AddAuthorizationBuilder()
    .AddPolicy(Policies.KeyPosession, p =>
    {
        p.Requirements.Add(DirectoryAccessRequirement.Content);
    })
    .AddPolicy(Policies.DirectoryOwner, p =>
    {
        p.RequireAuthenticatedUser();
        p.Requirements.Add(DirectoryAccessRequirement.Owner);
    })
    .AddPolicy(Policies.DirectoryOwnerWithKey, p =>
    {
        p.RequireAuthenticatedUser();
        p.Requirements.Add(DirectoryAccessRequirement.Content);
        p.Requirements.Add(DirectoryAccessRequirement.Owner);
    })
    .AddPolicy(Policies.DirectoryCreation, p =>
    {
        p.RequireAuthenticatedUser();
    });

builder.Services.AddSingleton<IAuthorizationHandler, DirectoryIdRequirementHandler>();
builder.Services.AddScoped<IFileStorage, FileSystemStorageService>();
builder.Services.AddOptions<FileSystemStorageOptions>()
    .Bind(builder.Configuration.GetSection(FileSystemStorageOptions.SectionName))
    .ValidateDataAnnotations();

builder.Services.AddRazorComponents();
builder.Services.AddCascadingAuthenticationState();

var app = builder.Build();

app.MapStaticAssets()
    .ShortCircuit();

app.UseRequestLocalization();
app.UseAuthentication();
app.UseAuthorization();
app.UseAntiforgery();


app.MapRazorComponents<App>();
app.MapFileSlingApi();

//if (app.Environment.IsDevelopment())
//{
//    app.UseViteDevelopmentServer(true);
//}

app.Run();
